package com.gccloud.gcpaas.core.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.core.constant.DataSourceType;
import com.gccloud.gcpaas.core.datasource.bean.BaseDataSource;
import com.gccloud.gcpaas.core.datasource.bean.MySqlDatasource;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 数据源定义
 */
@Data
@Schema
@TableName(value = "dr_data_source", autoResultMap = true)
public class DataSourceEntity extends BaseEntity {
    /**
     * 名称
     */
    @Schema(description = "名称")
    @NotBlank(message = "名称不能为空")
    private String name;
    /**
     * 唯一编码
     */
    @TableField(updateStrategy = FieldStrategy.NEVER)
    @Schema(description = "编码")
    private String code;
    /**
     * 数据源类型
     */
    @Schema(description = "数据源类型")
    @NotNull(message = "数据源类型不能为空")
    private DataSourceType dataSourceType;
    /**
     * 实际数据源
     */
    @Schema(description = "数据源配置")
    @NotNull(message = "数据源不能为空")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private BaseDataSource dataSource;

    public static void main(String[] args) throws JsonProcessingException {
        DataSourceEntity baseEntity = new DataSourceEntity();
        baseEntity.setId("1");
        MySqlDatasource mySqlDatasource = new MySqlDatasource();
        mySqlDatasource.setDriverName("mysql");
        baseEntity.setDataSource(mySqlDatasource);
        ObjectMapper objectMapper = new ObjectMapper();
        String data = objectMapper.writeValueAsString(baseEntity);
        System.out.println(data);

        DataSourceEntity dataSourceEntity = objectMapper.readValue(data, DataSourceEntity.class);
        System.out.println(dataSourceEntity);
    }
}
