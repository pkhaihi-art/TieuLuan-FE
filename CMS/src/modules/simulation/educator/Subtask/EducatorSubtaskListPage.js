import React from 'react';
import { Empty, Tag } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';

import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import { FieldTypes } from '@constants/formConfig';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import BaseTable from '@components/common/table/BaseTable';
import { calculateIndex } from '@utils';
import { useLocation } from 'react-router-dom';

const EducatorSubtaskListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const location = useLocation();
    const taskId = location.state?.taskId; // taskId từ trang Task

    const labels = {
        title: translate.formatMessage(commonMessage.title),
        description: translate.formatMessage(commonMessage.description),
        task: 'Task', // có thể dịch
        action: translate.formatMessage(commonMessage.action),
        noData: translate.formatMessage(commonMessage.noData),
    };

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: {
            getList: apiConfig.subtask.getListForEducator,
            delete: apiConfig.subtask.delete,
            create: apiConfig.subtask.create,
            update: apiConfig.subtask.update,
        },
        options: {
            objectName: labels.title,
            pageSize: 10,
        },
        override: (funcs) => {
            // thêm column task title nếu muốn
            funcs.renderTaskColumn = (columnsProps) => ({
                title: labels.task,
                dataIndex: ['task', 'title'],
                ...columnsProps,
            });

            // thêm filter mặc định taskId
            funcs.prepareGetListParams = (filter) => ({
                ...filter,
                taskId,
            });
        },
    });

    const columns = [
        {
            title: '#',
            width: '50px',
            align: 'center',
            render: (_, __, index) => calculateIndex(index, pagination, queryFilter),
        },
        {
            title: labels.title,
            dataIndex: 'title',
        },
        {
            title: labels.description,
            dataIndex: 'description',
            width: '250px',
        },
        mixinFuncs.renderTaskColumn({ width: '200px' }),
        mixinFuncs.renderActionColumn({ width: '120px' }),
    ];

    const searchFields = [
        { key: 'title', placeholder: labels.title },
        { key: 'taskId', placeholder: 'Task ID', type: FieldTypes.INPUT, initialValue: taskId },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
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
                        rowKey={(record) => record.id}
                        pagination={pagination}
                        locale={{ emptyText: <Empty description={labels.noData} /> }}
                    />
                }
            />
        </PageWrapper>
    );
};

export default EducatorSubtaskListPage;
