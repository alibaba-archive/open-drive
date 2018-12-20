//初始化ots表，如果表名存在，则不自动创建
module.exports = [{
    tableName: 'user',
    primaryKey: [
        {
            name: 'pk_user_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'admin',
    primaryKey: [
        {
            name: 'pk_user_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'storage',
    primaryKey: [
        {
            name: 'pk_storage_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'drive',
    primaryKey: [
        {
            name: 'pk_drive_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'drive_idx_creator',
    primaryKey: [
        {
            name: 'pk_creator',
            type: 'STRING'
        },
        {
            name: 'pk_drive_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'drive_idx_grant_to',
    primaryKey: [
        {
            name: 'pk_grant_to',
            type: 'STRING'
        },
        {
            name: 'pk_drive_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'drive_idx_storage',
    primaryKey: [
        {
            name: 'pk_storage_id',
            type: 'STRING'
        },
        {
            name: 'pk_drive_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'share',
    primaryKey: [
        {
            name: 'pk_share_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'share_idx_creator',
    primaryKey: [
        {
            name: 'pk_creator',
            type: 'STRING'
        },
        {
            name: 'pk_share_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'share_idx_grant_to',
    primaryKey: [
        {
            name: 'pk_grant_to',
            type: 'STRING'
        },
        {
            name: 'pk_share_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'share_idx_storage_path_grant_to',
    primaryKey: [
        {
            name: 'pk_storage_path',
            type: 'STRING'
        },
        {
            name: 'pk_grant_to',
            type: 'STRING'
        },
        {
            name: 'pk_share_id',
            type: 'STRING'
        }
    ]
}, {
    tableName: 'cache',
    primaryKey: [
        {
            name: 'pk_type_key',
            type: 'STRING'
        }
    ]
}]