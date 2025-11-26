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

const EducatorTaskListPage = ({ pageOptions, simulationId }) => {
    const translate = useTranslate();

    const labels = {
        title: translate.formatMessage(commonMessage.title),
        description: translate.formatMessage(commonMessage.description),
        simulation: translate.formatMessage(commonMessage.simulation),
        action: translate.formatMessage(commonMessage.action),
        noData: translate.formatMessage(commonMessage.noData),
    };

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: {
            getList: apiConfig.task.getListForEducator,
            delete: apiConfig.task.delete,
            create: apiConfig.task.create,
            update: apiConfig.task.update,
        },
        options: {
            objectName: labels.title,
            pageSize: 10,
        },
        override: (funcs) => {
            funcs.renderSimulationColumn = (columnsProps) => ({
                title: labels.simulation,
                dataIndex: ['simulation', 'title'], // từ API
                ...columnsProps,
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
        mixinFuncs.renderSimulationColumn({ width: '200px' }),
        mixinFuncs.renderActionColumn({ width: '120px' }),
    ];

    // ⚡ Thêm search field simulationId
    const searchFields = [
        { key: 'title', placeholder: labels.title },
        { key: 'simulationId', placeholder: 'Simulation ID', type: FieldTypes.SELECT, initialValue: simulationId },
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

export default EducatorTaskListPage;
