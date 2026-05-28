package com.gccloud.gcpaas.core.operationlog;

import com.gccloud.gcpaas.core.bean.PageVo;
import com.gccloud.gcpaas.core.entity.OperationLogEntity;
import com.gccloud.gcpaas.core.operationlog.dto.OperationLogQueryDTO;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OperationLogControllerTest {

    @Test
    void pageEndpointReturnsPagedLogsAndPassesFiltersToService() throws Exception {
        OperationLogService operationLogService = mock(OperationLogService.class);
        OperationLogController controller = new OperationLogController(operationLogService);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        OperationLogEntity entity = new OperationLogEntity();
        entity.setRequestUri("/dataRoom/user/login");
        entity.setOperatorName("admin");
        entity.setResultStatus("SUCCESS");
        entity.setBusinessName("认证登录");

        PageVo<OperationLogEntity> pageVo = new PageVo<>();
        pageVo.setCurrent(2);
        pageVo.setSize(20);
        pageVo.setTotal(1);
        pageVo.setData(List.of(entity));
        when(operationLogService.page(any(OperationLogQueryDTO.class))).thenReturn(pageVo);

        mockMvc.perform(get("/dataRoom/operationLog/page")
                        .param("keyword", "login")
                        .param("resultStatus", "SUCCESS")
                        .param("current", "2")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.current").value(2))
                .andExpect(jsonPath("$.data.size").value(20))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.data[0].requestUri").value("/dataRoom/user/login"))
                .andExpect(jsonPath("$.data.data[0].operatorName").value("admin"))
                .andExpect(jsonPath("$.data.data[0].resultStatus").value("SUCCESS"));

        ArgumentCaptor<OperationLogQueryDTO> captor = ArgumentCaptor.forClass(OperationLogQueryDTO.class);
        verify(operationLogService).page(captor.capture());
        assertEquals("login", captor.getValue().getKeyword());
        assertEquals("SUCCESS", captor.getValue().getResultStatus());
        assertEquals(Integer.valueOf(2), captor.getValue().getCurrent());
        assertEquals(Integer.valueOf(20), captor.getValue().getSize());
    }
}
