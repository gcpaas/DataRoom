package com.gccloud.gcpaas.core.util;

import com.gccloud.gcpaas.core.bean.Rsa;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.tomcat.util.codec.binary.Base64;

import javax.crypto.Cipher;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

/**
 * Apache Commons Codec 实现的 RSA 工具类（Apache 开源）
 * 支持：密钥生成、公钥加密、私钥解密、签名、验签
 */
@Slf4j
public class RsaUtils {
    // 加密算法
    private static final String RSA_ALGORITHM = "RSA";
    // 签名算法（SHA256+RSA，安全级别高）
    private static final String SIGN_ALGORITHM = "SHA256withRSA";
    // 密钥长度（2048位，兼顾安全性和性能；推荐生产用2048，1024已不安全）
    private static final int KEY_SIZE = 2048;
    // 字符编码
    private static final String CHARSET = "UTF-8";

    /**
     * 生成RSA密钥对（公钥+私钥）
     */
    public static Rsa generateRsaKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(RSA_ALGORITHM);
            keyPairGenerator.initialize(KEY_SIZE);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();

            // 公钥/私钥转Base64字符串（方便存储、传输）
            String publicKey = Base64.encodeBase64String(keyPair.getPublic().getEncoded());
            String privateKey = Base64.encodeBase64String(keyPair.getPrivate().getEncoded());

            Rsa rsa = new Rsa();
            rsa.setPublicKey(publicKey);
            rsa.setPrivateKey(privateKey);
            return rsa;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return null;
    }

    /**
     * 公钥加密（明文→密文，Base64格式）
     */
    public static String encryptByPublicKey(String plainText, String publicKey) {
        try {
            // Base64解码公钥
            byte[] publicKeyBytes = Base64.decodeBase64(publicKey);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(RSA_ALGORITHM);
            PublicKey pubKey = keyFactory.generatePublic(keySpec);

            // 加密
            Cipher cipher = Cipher.getInstance(RSA_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, pubKey);
            byte[] encryptBytes = cipher.doFinal(plainText.getBytes(CHARSET));
            return Base64.encodeBase64String(encryptBytes);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return null;
    }

    /**
     * 私钥解密（密文→明文）
     */
    public static String decryptByPrivateKey(String cipherText, String privateKey) {
        try {
            // Base64解码私钥
            byte[] privateKeyBytes = Base64.decodeBase64(privateKey);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(RSA_ALGORITHM);
            PrivateKey priKey = keyFactory.generatePrivate(keySpec);

            // 解密
            Cipher cipher = Cipher.getInstance(RSA_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, priKey);
            byte[] decryptBytes = cipher.doFinal(Base64.decodeBase64(cipherText));
            return new String(decryptBytes, CHARSET);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return null;
    }

    /**
     * 私钥签名（防止数据篡改）
     */
    public static String sign(String content, String privateKey) {
        try {
            byte[] privateKeyBytes = Base64.decodeBase64(privateKey);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(RSA_ALGORITHM);
            PrivateKey priKey = keyFactory.generatePrivate(keySpec);

            Signature signature = Signature.getInstance(SIGN_ALGORITHM);
            signature.initSign(priKey);
            signature.update(content.getBytes(CHARSET));
            return Base64.encodeBase64String(signature.sign());
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return null;
    }

    /**
     * 公钥验签（验证数据完整性）
     */
    public static boolean verifySign(String content, String publicKey, String sign) {
        try {
            byte[] publicKeyBytes = Base64.decodeBase64(publicKey);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance(RSA_ALGORITHM);
            PublicKey pubKey = keyFactory.generatePublic(keySpec);

            Signature signature = Signature.getInstance(SIGN_ALGORITHM);
            signature.initVerify(pubKey);
            signature.update(content.getBytes(CHARSET));
            return signature.verify(Base64.decodeBase64(sign));
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return false;
    }

    // 测试主方法（直接运行即可验证）
    public static void main(String[] args) throws Exception {
        // 1. 生成密钥对
        Rsa rsa = generateRsaKeyPair();
        String publicKey = rsa.getPublicKey();
        String privateKey = rsa.getPrivateKey();
        System.out.println("生成的公钥：\n" + publicKey);
        System.out.println("生成的私钥：\n" + privateKey);

        // 2. 待加密数据
        String plainText = "Hello Apache RSA!";
        System.out.println("\n原始明文：" + plainText);

        // 3. 公钥加密
        String cipherText = encryptByPublicKey(plainText, publicKey);
        System.out.println("公钥加密后密文：" + cipherText);

        // 4. 私钥解密
        String decryptText = decryptByPrivateKey(cipherText, privateKey);
        System.out.println("私钥解密后明文：" + decryptText);

        // 5. 签名+验签
        String sign = sign(plainText, privateKey);
        boolean verifyResult = verifySign(plainText, publicKey, sign);
        System.out.println("签名结果：" + sign);
        System.out.println("验签结果：" + verifyResult); // true=验证通过
    }
}