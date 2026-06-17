package com.gccloud.gcpaas.core.operationlog;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gccloud.gcpaas.dataroom.core.bean.PageVo;
import com.gccloud.gcpaas.dataroom.core.entity.OperationLogEntity;
import com.gccloud.gcpaas.dataroom.core.operationlog.dto.OperationLogQueryDTO;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogService;
import com.gccloud.gcpaas.dataroom.server.DataRoomApplication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(
        classes = DataRoomApplication.class,
        properties = {
                "spring.datasource.url=jdbc:h2:mem:operation_log_page;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1",
                "spring.datasource.username=root",
                "spring.datasource.password=dataRoom@2026"
        }
)
class OperationLogServicePaginationTest {

    @Autowired
    private OperationLogService operationLogService;

    @BeforeEach
    void setUp() {
        operationLogService.remove(new LambdaQueryWrapper<OperationLogEntity>()
                .like(OperationLogEntity::getRequestUri, "/pagination-test"));
    }

    @Test
    void pageReturnsTotalCountWhenRecordsExist() {
        List<OperationLogEntity> logs = new ArrayList<>();
        for (int index = 0; index < 12; index++) {
            OperationLogEntity log = new OperationLogEntity();
            log.setOperatorName("admin");
            log.setBusinessName("operation log");
            log.setActionDesc("pagination test");
            log.setRequestUri("/pagination-test/" + index);
            log.setRequestMethod("GET");
            log.setResultStatus("SUCCESS");
            log.setRequestTime(new Date(System.currentTimeMillis() + index));
            logs.add(log);
        }
        operationLogService.saveBatch(logs);

        OperationLogQueryDTO queryDTO = new OperationLogQueryDTO();
        queryDTO.setKeyword("/pagination-test");
        queryDTO.setCurrent(1);
        queryDTO.setSize(10);
        PageVo<OperationLogEntity> result = operationLogService.page(queryDTO);

        assertEquals(12, result.getTotal());
        assertEquals(10, result.getData().size());
    }
}
