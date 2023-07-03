import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 用于批量生成资源文件的sql
 * @author hongyang
 * @version 1.0
 * @date 2023/5/30 13:55
 */
@Slf4j
@RunWith(SpringRunner.class)
public class GetResourceSqlTest {

    /**
     * 需要处理的文件夹
     */
    public static final String FOLDER_PATH = "/Users/liuchengbiao/Desktop/大屏资源";

    /**
     * 服务存储文件的位置，即配置文件中的gc.file.basePath
     */
    public static final String FILE_BASE_PATH = "/root/bigscreen/file";

    /**
     * 静态资源接口前缀，即配置文件中的gc.file.urlPrefix
     */
    public static final String FILE_URL_PREFIX = "http://gcpaas.gccloud.com/bigScreenServer/static";

    /**
     * 文件所属分组编码
     */
    public static final String FILE_GROUP_CODE = "other";

    @Test
    public void getResourceSql() {
        List<String> sqlList = new ArrayList<>();

        // 需要处理的文件夹
        File folder = new File(FOLDER_PATH);

        if (!folder.exists() || !folder.isDirectory()) {
            log.error("文件夹不存在");
            return;
        }
        File[] subFiles = folder.listFiles();
        if (subFiles == null) {
            log.error("文件夹为空");
            return;
        }
        for (File subFile : subFiles) {
            String typeCode = FILE_GROUP_CODE;
            if (subFile.isDirectory()) {
                // 获取文件夹名称
                String folderName = subFile.getName();
                // 生成编码
                typeCode = RandomStringUtils.randomAlphanumeric(10).toLowerCase();
                // 创建时间
                String currentDate = getCurrentDateTime();
                String insertTypeSql = "INSERT INTO big_screen_type (name, code, type, order_num, update_date, create_date, del_flag) VALUES ('%s', '%s', '%s', %s, '%s', '%s', %s);";
                String insertTypeSqlFormat = String.format(insertTypeSql, folderName, typeCode, "resourceCatalog", 0, currentDate, currentDate, 0);
                sqlList.add("# 分组");
                sqlList.add(insertTypeSqlFormat);
                sqlList.add("# 资源");
            }
            handleFile(subFile, "", sqlList, typeCode);
        }
        // 将sql输出到文件
        String sql = String.join("\n", sqlList);
        String fileName = "big_screen_file.sql";
        String filePath = FOLDER_PATH + "/" + fileName;
        // 写入文件
        try {
            FileUtils.write(new File(filePath), sql, "UTF-8");
        } catch (Exception e) {
            log.error("写入sql文件失败");
            log.error(ExceptionUtils.getStackTrace(e));
        }
        log.info("sql生成到文件：{}", FOLDER_PATH + "/big_screen_file.sql");
        log.info("重命名后的文件路径：{}", FOLDER_PATH + "_重命名");
    }


    /**
     * 处理文件/文件夹
     * @param file 文件/文件夹
     * @param relativePath 相对路径（相对于FOLDER_PATH）
     * @param sqlList sql列表
     */
    private static void handleFile(File file, String relativePath, List<String> sqlList, String typeCode) {
        if (file.isDirectory()) {
            File[] files = file.listFiles();
            if (files == null) {
                return;
            }
            for (File subFile : files) {
                String subRelativePath = relativePath + "/" + file.getName();
                handleFile(subFile, subRelativePath, sqlList, typeCode);
            }
            return;
        }
        // 原始文件名
        String originalName = file.getName();
        // 文件后缀
        String extension = getFileExtension(originalName);
        // 新文件名
        String newFileName = IdWorker.getIdStr()+ "." + extension;
        // 新文件路径
        String newPath = FOLDER_PATH + "_重命名" + relativePath + "/" + newFileName;
        // 复制文件
        Path sourcePath = file.toPath();
        Path targetPath = new File(newPath).toPath();
        try {
            // 创建文件夹
            Files.createDirectories(targetPath.getParent());
            Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        // 在服务器上的文件路径
        String path = FILE_BASE_PATH + relativePath;
        // 文件访问地址
        String url = FILE_URL_PREFIX + relativePath + "/" + newFileName;
        // 替换可能存在的反斜杠
        url = url.replace("\\", "/");
        // 文件大小
        long size = file.length();
        // 创建时间
        String currentDate = getCurrentDateTime();
        // 生成sql
        String sql = String.format("INSERT INTO big_screen_file (module, original_name, new_name, extension, path, url, size, download_count, create_date, update_date, del_flag) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', %d, %d, '%s', '%s', %d);",
                typeCode, originalName, newFileName, extension, path, url, size, 0, currentDate, currentDate, 0);
        sqlList.add(sql);
    }


    /**
     * 获取文件后缀
     * @param fileName
     * @return
     */
    private static String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1);
        }
        return "";
    }


    /**
     * 获取当前时间
     * @return
     */
    private static String getCurrentDateTime() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date currentDate = new Date();
        return dateFormat.format(currentDate);
    }
}

