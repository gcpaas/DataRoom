package com.gccloud.dataroom.core.module.basic.entity.type;

import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * List<Integer> 与 字符串自动转换，使用;分割形式，便于查询
 *
 * @author hongyang
 * @version 1.0
 * @date 2024/4/2 15:11
 */
@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(List.class)
public class ListTypeHandler extends BaseTypeHandler<List<Integer>> {

    @Override
    public void setNonNullParameter(PreparedStatement preparedStatement, int i, List<Integer> obj, JdbcType jdbcType) throws SQLException {
        // 转成1;2;2;
        StringBuilder sb = new StringBuilder();
        for (Integer integer : obj) {
            sb.append(integer).append(";");
        }
        preparedStatement.setString(i, sb.toString());
    }

    @Override
    public List<Integer> getNullableResult(ResultSet resultSet, String columnName) throws SQLException {
        String data = resultSet.getString(columnName);
        if (StringUtils.isBlank(data)) {
            return null;
        }
        List<Integer> list = Lists.newArrayList();
        String[] split = data.split(";");
        for (String s : split) {
            list.add(Integer.parseInt(s));
        }
        return list;
    }


    @Override
    public List<Integer> getNullableResult(ResultSet resultSet, int i) throws SQLException {
        String data = resultSet.getString(i);
        if (StringUtils.isBlank(data)) {
            return null;
        }
        List<Integer> list = Lists.newArrayList();
        String[] split = data.split(";");
        for (String s : split) {
            list.add(Integer.parseInt(s));
        }
        return list;
    }

    @Override
    public List<Integer> getNullableResult(CallableStatement callableStatement, int i) throws SQLException {
        String data = callableStatement.getString(i);
        if (StringUtils.isBlank(data)) {
            return null;
        }
        List<Integer> list = Lists.newArrayList();
        String[] split = data.split(";");
        for (String s : split) {
            list.add(Integer.parseInt(s));
        }
        return list;
    }
}

