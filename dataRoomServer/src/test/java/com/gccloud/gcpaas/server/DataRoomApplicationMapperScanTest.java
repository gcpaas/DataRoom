package com.gccloud.gcpaas.server;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.annotation.MapperScan;

import static org.assertj.core.api.Assertions.assertThat;

class DataRoomApplicationMapperScanTest {

    @Test
    void mapperScanOnlyScansMapperPackage() {
        MapperScan mapperScan = DataRoomApplication.class.getAnnotation(MapperScan.class);

        assertThat(mapperScan).isNotNull();
        assertThat(getMapperScanPackages(mapperScan)).containsExactly("com.gccloud.gcpaas.core.mapper");
    }

    private String[] getMapperScanPackages(MapperScan mapperScan) {
        if (mapperScan.value().length > 0) {
            return mapperScan.value();
        }
        return mapperScan.basePackages();
    }
}
