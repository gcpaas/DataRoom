package com.gccloud.dataroom.core.vo;

import com.baomidou.mybatisplus.core.metadata.IPage;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 分页结果封装
 */
@ApiModel(description = "分页")
@Data
public class PageVO<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(notes = "总条数")
    private long totalCount;

    @ApiModelProperty(notes = "每页条数")
    private long size;

    @ApiModelProperty(notes = "总页数")
    private long totalPage;

    @ApiModelProperty(notes = "当前页数")
    private long current;

    @ApiModelProperty(notes = "列表数据")
    private List<T> list;

    /**
     * 分页
     */
    public PageVO(IPage<T> page) {
        this.list = page.getRecords();
        this.totalCount = page.getTotal();
        this.size = page.getSize();
        this.current = page.getCurrent();
        this.totalPage = page.getPages();
    }

    public PageVO() {
    }

}
