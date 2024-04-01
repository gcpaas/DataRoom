/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.gccloud.dataroom.core.module.file.vo;

import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import lombok.Data;

import java.io.Serializable;
import java.text.DecimalFormat;

@Data
public class DataRoomFileVO extends DataRoomFileEntity implements Serializable {
    /**
     * 暂用空间，根据size进行计算出来
     */
    private String space;

    public String getSpace() {
        long size = this.getSize();
        if (size <= 0) {
            return "0";
        }
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1000));
        return new DecimalFormat("#,##0.##").format(size / Math.pow(1000, digitGroups)) + " " + units[digitGroups];
    }
}