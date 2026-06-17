# 用户管理模块设计方案

## 1. 背景

当前系统用户信息存储在 `application-base.yml` 配置文件中，无法动态管理用户。需要改造为数据库存储，支持完整的 CRUD 操作。

## 2. 需求

- **用户字段**：账号(account)、用户名(username)、角色(roleList)、密码(password)、联系电话(phone)、状态(status)
- **状态枚举**：正常(NORMAL)、禁用(DISABLED)、密码过期(PASSWORD_EXPIRED)
- **角色**：系统内置三种角色 manager、developer、sharer，支持多选
- **操作**：新建、编辑、删除用户

## 3. 数据库设计

### 3.1 dr_user 用户表

```sql
CREATE TABLE dr_user (
    id VARCHAR(64) PRIMARY KEY COMMENT '主键ID',
    account VARCHAR(100) NOT NULL UNIQUE COMMENT '账号',
    username VARCHAR(100) NOT NULL COMMENT '用户名',
    password VARCHAR(500) NOT NULL COMMENT '密码（加密存储）',
    phone VARCHAR(20) COMMENT '联系电话',
    role VARCHAR(200) COMMENT '角色编码，多个用逗号分隔，如：manager,developer',
    status VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '状态：NORMAL-正常 DISABLED-禁用 PASSWORD_EXPIRED-密码过期',
    expire_date DATETIME COMMENT '有效期截止时间，NULL 表示永久有效',
    create_date DATETIME COMMENT '创建时间',
    create_user VARCHAR(64) COMMENT '创建人',
    update_date DATETIME COMMENT '更新时间',
    update_user VARCHAR(64) COMMENT '更新人',
    tenant_code VARCHAR(64) COMMENT '租户编码',
    del_flag CHAR(1) NOT NULL DEFAULT '0' COMMENT '删除标志：0-未删除 1-已删除'
) COMMENT '用户表';
```

### 3.2 初始数据

```sql
-- 管理员账号（密码为123456，存储时为RSA加密后的密文）
INSERT INTO dr_user (id, account, username, password, role, status, tenant_code)
VALUES ('1', 'admin', '管理员', 'RSA加密后的密文', 'manager,developer,sharer', 'NORMAL', 'default');
```

## 4. 后端设计

### 4.1 关键文件

| 类型 | 路径 |
|------|------|
| Entity | `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/entity/UserEntity.java` |
| Mapper | `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/mapper/UserMapper.java` |
| Service | `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/user/service/UserService.java` |
| Controller | `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/user/UserController.java` |
| DTO | `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/user/dto/UserDTO.java` |
| Enum | `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/constant/UserStatus.java` |

### 4.2 现有可复用代码

- **BaseEntity**：`dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/entity/BaseEntity.java`
- **Resp**：`dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/bean/Resp.java`
- **PageVo**：`dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/bean/PageVo.java`
- **MybatisMetaObjectHandler**：自动填充 createDate、updateDate 等字段
- **DataRoomException**：自定义异常
- **DataRoomRole**：内置角色常量接口

### 4.3 后端实现步骤

1. 创建 `UserStatus` 枚举类（Normal、Disabled、PasswordExpired）
2. 创建 `UserEntity` 实体类，继承 BaseEntity，包含 role 字段
3. 创建 `UserMapper` 接口
4. 创建 `UserService` 服务类，实现用户 CRUD
5. 创建 `UserDTO` 用于前端请求参数
6. 创建 `UserController`，提供 CRUD 接口
7. 修改 `ShiroAuthRealm` 支持数据库用户认证
8. 创建数据库初始化脚本

### 4.4 Controller 接口设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /dataRoom/user/page | 分页查询用户列表 |
| GET | /dataRoom/user/detail/{id} | 获取用户详情 |
| POST | /dataRoom/user/add | 新增用户 |
| POST | /dataRoom/user/update | 更新用户 |
| POST | /dataRoom/user/delete/{id} | 删除用户 |
| POST | /dataRoom/user/resetPassword/{id} | 重置密码 |

## 5. 前端设计

### 5.1 导航入口

在 `UpDownLayout.vue` 头部右侧头像下拉菜单中新增"控制台"菜单项，点击进入用户管理页面。

### 5.2 关键文件

| 类型 | 路径 |
|------|------|
| 页面 | `dataRoomFront/src/dataRoom/user/index.vue` |
| API | `dataRoomFront/src/dataRoom/user/api.ts` |
| 编辑弹窗组件 | `dataRoomFront/src/dataRoom/user/components/UserEdit.vue` |

### 5.3 现有可复用模式

- **API 调用**：`dataRoomFront/src/dataRoom/_common/_request.ts` 的 request 封装
- **列表页模式**：`dataRoomFront/src/dataRoom/page/index.vue`
- **表单验证**：`dataRoomFront/src/dataRoom/dataset/components/HttpEditor.vue`
- **表格+分页**：Element Plus `el-table` + `el-pagination`

### 5.4 前端实现步骤

1. 修改 `UpDownLayout.vue`，在下拉菜单中新增"控制台"菜单项
2. 在路由中注册用户管理页面路径 `/dataRoom/user`
3. 创建 `user/api.ts` 定义用户相关 API
4. 创建 `user/components/UserEdit.vue` 用户编辑弹窗组件
5. 创建 `user/index.vue` 用户管理列表页面

## 6. 状态显示映射

| 状态值 | 中文显示 | 标签类型 |
|--------|----------|----------|
| NORMAL | 正常 | success |
| DISABLED | 禁用 | danger |
| PASSWORD_EXPIRED | 密码过期 | warning |

## 7. 密码加密

采用与登录一致的 RSA 加密方式：

- **前端**：使用 RSA 公钥加密密码后传输
- **后端**：使用 RSA 私钥解密后存储（或验证时直接比对）
- **存储**：密码以明文存储在数据库中（与现有登录逻辑一致）
- **验证**：解密后与数据库中密码比对

关键代码参考：
- 加密工具：`RsaUtils.java`
- 登录验证逻辑：`UserController.login()` 第 75-78 行

## 8. 验证步骤

1. 后端启动 `mvn spring-boot:run -pl dataRoomServer`
2. 前端启动 `cd dataRoomFront && npm run dev`
3. 访问用户管理页面，验证：
   - 用户列表分页查询正常
   - 新建用户成功
   - 编辑用户成功
   - 删除用户成功
   - 状态切换正常
   - 使用新创建用户登录系统验证认证集成
