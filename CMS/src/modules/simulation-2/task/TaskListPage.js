import React from 'react';
import { Empty, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';

import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import { statusOptions } from '@constants/masterData';
import { commonMessage } from '@locales/intl';

import BaseTable from '@components/common/table/BaseTable';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';

import { calculateIndex, getColumnWidth } from '@utils';

const TaskListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const { simulationId } = useParams();

    const formattedStatusOptions = translate.formatKeys(statusOptions, ['label']);

    const labels = {
        name: translate.formatMessage(commonMessage.name),
        description: translate.formatMessage(commonMessage.description),
        orderSort: translate.formatMessage(commonMessage.orderSort),
        status: translate.formatMessage(commonMessage.status),
        noData: translate.formatMessage(commonMessage.noData),
        viewQuestions: 'Xem Questions',
    };

    const statusValues = formattedStatusOptions.map(item => ({
        value: item.value,
        label: item.label,
    }));

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: {
            getList: apiConfig.task.getList,
            delete: apiConfig.task.delete,
            update: apiConfig.task.update,
        },
        options: {
            objectName: 'task',
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
        },
        override: (funcs) => {
            funcs.getList = () => {
                const params = mixinFuncs.prepareGetListParams(queryFilter);
                mixinFuncs.handleFetchList({ ...params, simulationId });
            };

            const statusMap = {
                1: { label: translate.formatMessage(commonMessage.statusActive), color: '#00A648' },
                0: { label: translate.formatMessage(commonMessage.statusInactive), color: '#CC0000' },
            };

            funcs.renderStatusColumn = (columnsProps) => ({
                title: translate.formatMessage(commonMessage.status),
                dataIndex: 'status',
                align: 'center',
                ...columnsProps,
                render: (status) => {
                    const item = statusMap[status] || {};
                    return (
                        <Tag color={item.color}>
                            <div style={{ padding: '0 4px', fontSize: 14 }}>{item.label}</div>
                        </Tag>
                    );
                },
            });

            const originalActionColumnButtons = funcs.actionColumnButtons;

            funcs.actionColumnButtons = (additionalButtons = {}) => ({
                ...originalActionColumnButtons(additionalButtons),
                viewQuestions: ({ id, ...record }) => (
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/simulation/${simulationId}/tasks/${id}/questions`);
                        }}
                        style={{ padding: 0 }}
                    >
                        <EyeOutlined />
                    </Button>
                ),
            });
        },
    });

    const columns = [
        {
            title: '#',
            width: '40px',
            align: 'center',
            render: (_, __, index) => calculateIndex(index, pagination, queryFilter),
        },
        {
            title: labels.name,
            dataIndex: 'name',
        },
        {
            title: labels.orderSort,
            dataIndex: 'orderSort',
            align: 'center',
            width: '100px',
        },
        mixinFuncs.renderStatusColumn({ width: '120px' }),
        mixinFuncs.renderActionColumn(
            {
                edit: record =>
                    mixinFuncs.hasPermission([apiConfig.task.update.permissionCode]),
                delete: record =>
                    mixinFuncs.hasPermission([apiConfig.task.delete.permissionCode]),
                viewQuestions: true,
            },
            {
                width: '160px',
                title: labels.viewQuestions,
            },
        ),
    ];

    const searchFields = [
        { key: 'name', placeholder: labels.name },
        {
            key: 'status',
            placeholder: labels.status,
            type: FieldTypes.SELECT,
            options: statusValues,
        },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate, null, { simulationId })}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: queryFilter,
                })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        rowKey={record => record.id}
                        pagination={pagination}
                        onRow={(record, idx) => ({
                            style: { backgroundColor: idx % 2 ? '#f9f9f9' : '#ffffff' },
                        })}
                        locale={{
                            emptyText: <Empty description={labels.noData} />,
                        }}
                    />
                }
            />
        </PageWrapper>
    );
};

export default TaskListPage;