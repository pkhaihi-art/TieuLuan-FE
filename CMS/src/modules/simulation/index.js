import React from 'react';
import { Empty, Tag, Button } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import useListBase from '@hooks/useListBase';
import useFetch from '@hooks/useFetch';
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
    const navigate = useNavigate();

    const formattedStatusOptions = translate.formatKeys(simulationStatusOptions, ['label']);
    const formattedLevelOptions = translate.formatKeys(levelOptions, ['label']);

    const statusMap = Object.fromEntries(formattedStatusOptions.map(item => [item.value, item]));
    const levelMap = Object.fromEntries(formattedLevelOptions.map(item => [item.value, item]));

    const labels = {
        title: translate.formatMessage(commonMessage.title),
        specialization: translate.formatMessage(commonMessage.specialization),
        educator: translate.formatMessage(commonMessage.educator),
        level: translate.formatMessage(commonMessage.level),
        status: translate.formatMessage(commonMessage.status),
        noData: translate.formatMessage(commonMessage.noData),
        image: translate.formatMessage(commonMessage.image),
        simulation: translate.formatMessage(commonMessage.simulation),
        action: translate.formatMessage(commonMessage.action),
        task: translate.formatMessage(commonMessage.task),
    };

    const statusValues = formattedStatusOptions.map(item => ({ value: item.value, label: item.label }));
    const levelValues = formattedLevelOptions.map(item => ({ value: item.value, label: item.label }));

    // Khởi tạo hooks bên ngoài
    const { execute: executeApprove } = useFetch(apiConfig.simulation.approve);
    const { execute: executeApproveDelete } = useFetch(apiConfig.simulation.approveDelete);

    const { data, mixinFuncs, queryFilter, loading, pagination, setData, setLoading } = useListBase({
        apiConfig: {
            getList: apiConfig.simulation.getList,
            delete: apiConfig.simulation.delete,
            update: apiConfig.simulation.update,
            changeStatus: null,
            approve: apiConfig.simulation.approve,
            approveDelete: apiConfig.simulation.approveDelete,
        },
        options: {
            objectName: labels.simulation,
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
        },
        override: (funcs) => {
            // Hàm xử lý Approve
            funcs.handleApprove = (id) => {
                if (!apiConfig.simulation.approve) return;
                
                setLoading(true);
                
                executeApprove({
                    data: { id },
                    onCompleted: (response) => {
                        const { result, message } = response.data;
                        if (result === true) {
                            mixinFuncs.notification({ 
                                type: 'success', 
                                message: `Phê duyệt ${labels.simulation} thành công${message ? ': ' + message : ''}` ,
                            });
                            
                            // Cập nhật status trong bảng thành 1
                            setData(prevData => prevData.map(item => 
                                item.id === id ? { ...item, status: 1 } : item,
                            ));
                        } else {
                            mixinFuncs.notification({ 
                                type: 'error', 
                                message: `Phê duyệt ${labels.simulation} chưa thành công${message ? ': ' + message : ''}` ,
                            });
                        }
                        setLoading(false);
                    },
                    onError: (error) => {
                        mixinFuncs.handleGetListError(error);
                        setLoading(false);
                    },
                });
            };

            // Hàm xử lý Approve Delete
            funcs.handleApproveDelete = (id) => {
                if (!apiConfig.simulation.approveDelete) return;
                
                setLoading(true);

                executeApproveDelete({
                    pathParams: { id },
                    onCompleted: (response) => {
                        const { result, message } = response.data;
                        if (result === true) {
                            mixinFuncs.notification({ 
                                type: 'success', 
                                message: `Phê duyệt xoá ${labels.simulation} thành công${message ? ': ' + message : ''}` ,
                            });
                            
                            // Cập nhật status trong bảng thành 2
                            setData(prevData => prevData.map(item => 
                                item.id === id ? { ...item, status: 2 } : item,
                            ));
                        } else {
                            mixinFuncs.notification({ 
                                type: 'error', 
                                message: `Phê duyệt xoá ${labels.simulation} chưa thành công${message ? ': ' + message : ''}` ,
                            });
                        }
                        setLoading(false);
                    },
                    onError: (error) => {
                        mixinFuncs.handleGetListError(error);
                        setLoading(false);
                    },
                });
            };

            // Override action column buttons
            const originalActionColumnButtons = funcs.actionColumnButtons;
            funcs.actionColumnButtons = (additionalButtons = {}) => ({
                ...originalActionColumnButtons(additionalButtons),
                
                // Nút Task
                task: ({ id }) => (
                    <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/simulation/${id}/task`);
                        }}
                        title={labels.task}
                    >
                        <UnorderedListOutlined />
                    </Button>
                ),
                
                // Nút Approve (hiển thị khi status === 0)
                approve: ({ id, status, buttonProps }) => 
                    status === 1 ? (
                        <Button
                            {...buttonProps}
                            type="link"
                            style={{ padding: 0, color: '#52c41a' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                funcs.handleApprove(id);
                            }}
                            title="Phê duyệt"
                        >
                            <CheckCircleOutlined />
                        </Button>
                    ) : null,
                
                // Nút Approve Delete (hiển thị khi status === 2)
                approveDelete: ({ id, status, buttonProps }) => 
                    status === 2 ? (
                        <Button
                            {...buttonProps}
                            type="link"
                            style={{ padding: 0, color: '#fa8c16' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                funcs.handleApproveDelete(id);
                            }}
                            title="Phê duyệt xoá"
                        >
                            <DeleteOutlined />
                        </Button>
                    ) : null,
            });

            // Override renderStatusColumn
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
            title: translate.formatMessage(commonMessage.description),
            dataIndex: 'description',
            width: '250px',
            ellipsis: true,
        },
        {
            title: labels.level,
            dataIndex: 'level',
            align: 'center',
            width: '120px',
            render: level => levelMap[level]?.label || 'N/A',
        },
        {
            title: labels.specialization,
            dataIndex: ['specialization', 'name'],
            align: 'center',
            width: '150px',
        },
        {
            title: translate.formatMessage(commonMessage.totalEstimatedTime),
            dataIndex: 'totalEstimatedTime',
            width: '140px',
        },
        mixinFuncs.renderStatusColumn({ width: '120px' }),
        mixinFuncs.renderActionColumn(
            {
                edit: () => mixinFuncs.hasPermission([apiConfig.simulation.update.permissionCode]),
                task: () => mixinFuncs.hasPermission([apiConfig.task.getList.permissionCode]),
                approve: (dataRow) => dataRow.status === 1, // Hiển thị khi status = 0
                approveDelete: (dataRow) => dataRow.status === 2, // Hiển thị khi status = 2
            },
            { width: '180px', title: labels.action },
        ),
    ];

    const searchFields = [
        { key: 'title', placeholder: labels.title },
        { key: 'level', placeholder: labels.level, type: FieldTypes.SELECT, options: levelValues },
        { key: 'status', placeholder: labels.status, type: FieldTypes.SELECT, options: statusValues },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
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
                        locale={{ emptyText: <Empty description={labels.noData} /> }}
                    />
                }
            />
        </PageWrapper>
    );
};

export default SimulationListPage;