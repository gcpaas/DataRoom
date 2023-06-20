package com.gccloud.dataroom.core.module.basic.entity.type;

import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.common.utils.JSON;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * JSONObject 与 字符串自动转换
 *
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(BasePageDTO.class)
public class BasePageDTOTypeHandler extends BaseTypeHandler<BasePageDTO> {

    @Override
    public void setNonNullParameter(PreparedStatement preparedStatement, int i, BasePageDTO obj, JdbcType jdbcType) throws SQLException {
        String data = JSON.toJSONString(obj);
        preparedStatement.setString(i, data);
    }

    @Override
    public BasePageDTO getNullableResult(ResultSet resultSet, String columnName) throws SQLException {
        String data = resultSet.getString(columnName);
        if (StringUtils.isBlank(data)) {
            return null;
        }
        BasePageDTO basePageDTO = JSON.parseObject(data, BasePageDTO.class);
        return basePageDTO;
    }

    @Override
    public BasePageDTO getNullableResult(ResultSet resultSet, int i) throws SQLException {
        String data = resultSet.getString(i);
        if (StringUtils.isBlank(data)) {
            return null;
        }
        BasePageDTO basePageDTO = JSON.parseObject(data, BasePageDTO.class);
        return basePageDTO;
    }

    @Override
    public BasePageDTO getNullableResult(CallableStatement callableStatement, int i) throws SQLException {
        String data = callableStatement.getString(i);
        if (StringUtils.isBlank(data)) {
            return null;
        }
        BasePageDTO basePageDTO = JSON.parseObject(data, BasePageDTO.class);
        return basePageDTO;
    }
}

