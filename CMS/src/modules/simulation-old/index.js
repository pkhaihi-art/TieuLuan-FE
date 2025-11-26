import React from 'react';
import { Empty, Tag } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons'; // Using a more relevant icon for simulation

import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';

import { AppConstants, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import { simulationStatusOptions, levelOptions } from '@constants/masterData';
import { commonMessage } from '@locales/intl';

import AvatarField from '@components/common/form/AvatarField';
import BaseTable from '@components/common/table/BaseTable';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';

import { calculateIndex } from '@utils';

const SimulationListPage = ({ pageOptions }) => {
    const translate = useTranslate();

    const formattedStatusOptions = translate.formatKeys(simulationStatusOptions, ['label']);
    const formattedLevelOptions = translate.formatKeys(levelOptions, ['label']);

    const statusMap = Object.fromEntries(
        formattedStatusOptions.map(item => [item.value, item]),
    );
    const levelMap = Object.fromEntries(
        formattedLevelOptions.map(item => [item.value, item]),
    );

    const labels = {
        title:          translate.formatMessage(commonMessage.title),
        specialization: translate.formatMessage(commonMessage.specialization),
        educator:       translate.formatMessage(commonMessage.educator),
        level:          translate.formatMessage(commonMessage.level),
        status:         translate.formatMessage(commonMessage.status),
        noData:         translate.formatMessage(commonMessage.noData),
        image:          translate.formatMessage(commonMessage.image),
        simulation:     translate.formatMessage(commonMessage.simulation),
        action:         translate.formatMessage(commonMessage.action),
    };

    const statusValues = formattedStatusOptions.map(item => ({
        value: item.value,
        label: item.label,
    }));

    const levelValues = formattedLevelOptions.map(item => ({
        value: item.value,
        label: item.label,
    }));

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: {
            getList:      apiConfig.simulation.getList,
            delete:       apiConfig.simulation.delete,
            update:       apiConfig.simulation.update,
            changeStatus: apiConfig.simulation.changeStatus,
        },
        options: {
            objectName: labels.simulation,
            pageSize:   DEFAULT_TABLE_ITEM_SIZE,
        },
        override: (funcs) => {
            // Override the status column rendering
            funcs.renderStatusColumn = (columnsProps) => ({
                title: labels.status,
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
            title: labels.image,
            dataIndex: 'imagePath',
            align: 'center',
            width: '100px',
            render: imagePath => (
                <AvatarField
                    size="large"
                    icon={<AppstoreOutlined />}
                    src={imagePath ? `${AppConstants.contentRootUrl}${imagePath}` : null}
                    shape="square"
                />
            ),
        },
        {
            title: labels.title,
            dataIndex: 'title',
        },
        {
            title: labels.specialization,
            dataIndex: ['specialization', 'name'],
            width: '180px',
        },
        {
            title: labels.educator,
            dataIndex: ['educator', 'account', 'fullName'],
            width: '200px',
        },
        {
            title: labels.level,
            dataIndex: 'level',
            align: 'center',
            width: '120px',
            render: level => levelMap[level]?.label || 'N/A',
        },
        mixinFuncs.renderStatusColumn({ width: '120px' }),
        mixinFuncs.renderActionColumn(
            {
                edit: record =>
                    mixinFuncs.hasPermission([apiConfig.simulation.update.permissionCode]),
                // delete: record =>
                //     mixinFuncs.hasPermission([apiConfig.simulation.delete.permissionCode]),
            },
            { width: '120px', title: labels.action },
        ),
    ];

    const searchFields = [
        { key: 'title', placeholder: labels.title },
        {
            key: 'level',
            placeholder: labels.level,
            type: FieldTypes.SELECT,
            options: levelValues,
        },
        {
            key: 'status',
            placeholder: labels.status,
            type: FieldTypes.SELECT,
            options: statusValues,
        },
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

export default SimulationListPage;
