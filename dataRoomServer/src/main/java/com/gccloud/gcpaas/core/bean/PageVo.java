package com.gccloud.gcpaas.core.bean;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.Data;

import java.util.List;

@Data
public class PageVo<T> {
    /**
     * 总数
     */
    protected long total = 0;
    /**
     * 每页显示条数，默认 10
     */
    protected long size = 10;
    /**
     * 当前页
     */
    protected long current = 1;
    /**
     * 数据
     */
    protected List<T> data;

    public static PageVo build(Page page) {
        PageVo pageVo = new PageVo<>();
        pageVo.setCurrent(page.getCurrent());
        pageVo.setSize(page.getSize());
        pageVo.setTotal(page.getTotal());
        pageVo.setData(page.getRecords());
        return pageVo;
    }
}
