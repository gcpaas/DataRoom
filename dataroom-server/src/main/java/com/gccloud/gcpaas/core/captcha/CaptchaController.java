package com.gccloud.gcpaas.core.captcha;

import com.github.benmanes.caffeine.cache.Cache;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Random;
import java.util.UUID;

@Tag(name = "验证码")
@RestController
@RequestMapping("/dataRoom/captcha")
public class CaptchaController {

    @Resource(name = "captchaCache")
    private Cache<String, String> captchaCache;

    private static final int WIDTH = 120;
    private static final int HEIGHT = 40;
    private static final int CODE_LENGTH = 4;
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final Random RANDOM = new Random();

    @GetMapping("/generate")
    @Operation(summary = "生成验证码", description = "生成图像验证码，返回图片和captchaKey响应头")
    public void generate(HttpServletResponse response) throws IOException {
        // 生成验证码文本
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        String captchaText = code.toString();

        // 生成唯一key并缓存（忽略大小写，统一存储小写）
        String captchaKey = UUID.randomUUID().toString().replace("-", "");
        captchaCache.put(captchaKey, captchaText.toLowerCase());

        // 生成验证码图片
        BufferedImage image = createCaptchaImage(captchaText);

        // 设置响应
        response.setContentType("image/png");
        response.setHeader("Cache-Control", "no-store, no-cache");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Captcha-Key", captchaKey);
        response.setHeader("Access-Control-Expose-Headers", "Captcha-Key");
        ImageIO.write(image, "PNG", response.getOutputStream());
    }

    private BufferedImage createCaptchaImage(String text) {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();

        // 设置抗锯齿
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // 填充背景
        g.setColor(new Color(240, 240, 240));
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // 绘制干扰线
        for (int i = 0; i < 6; i++) {
            g.setColor(new Color(RANDOM.nextInt(200), RANDOM.nextInt(200), RANDOM.nextInt(200)));
            int x1 = RANDOM.nextInt(WIDTH);
            int y1 = RANDOM.nextInt(HEIGHT);
            int x2 = RANDOM.nextInt(WIDTH);
            int y2 = RANDOM.nextInt(HEIGHT);
            g.drawLine(x1, y1, x2, y2);
        }

        // 绘制干扰点
        for (int i = 0; i < 30; i++) {
            g.setColor(new Color(RANDOM.nextInt(255), RANDOM.nextInt(255), RANDOM.nextInt(255)));
            g.fillOval(RANDOM.nextInt(WIDTH), RANDOM.nextInt(HEIGHT), 2, 2);
        }

        // 绘制验证码文字
        g.setFont(new Font("Arial", Font.BOLD, 28));
        for (int i = 0; i < text.length(); i++) {
            g.setColor(new Color(RANDOM.nextInt(100), RANDOM.nextInt(100), RANDOM.nextInt(100)));
            // 随机旋转角度
            double angle = (RANDOM.nextDouble() - 0.5) * 0.4;
            int x = 10 + i * 26;
            int y = 28 + RANDOM.nextInt(6);
            g.rotate(angle, x, y);
            g.drawString(String.valueOf(text.charAt(i)), x, y);
            g.rotate(-angle, x, y);
        }

        g.dispose();
        return image;
    }
}
