import React from 'react';
import { Empty, Tag, Button, Modal } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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

import { calculateIndex } from '@utils';

const SimulationListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const navigate = useNavigate();

    const formattedStatusOptions = translate.formatKeys(statusOptions, ['label']);

    const labels = {
        title: 'Tiêu đề',
        description: translate.formatMessage(commonMessage.description),
        level: 'Cấp độ',
        specialization: 'Chuyên ngành',
        educator: 'Giảng viên',
        totalEstimatedTime: 'Thời gian ước tính',
        avgRating: 'Đánh giá TB',
        status: translate.formatMessage(commonMessage.status),
        noData: translate.formatMessage(commonMessage.noData),
        viewTasks: 'Xem Tasks',
        approve: 'Chấp nhận',
        reject: 'Từ chối',
        approveDelete: 'Chấp nhận xóa',
        rejectDelete: 'Từ chối xóa',
        confirmApprove: 'Bạn có chắc muốn chấp nhận simulation này?',
        confirmReject: 'Bạn có chắc muốn từ chối simulation này?',
        confirmApproveDelete: 'Bạn có chắc muốn chấp nhận yêu cầu xóa?',
        confirmRejectDelete: 'Bạn có chắc muốn từ chối yêu cầu xóa?',
        requestDelete: 'Yêu cầu xóa',
    };

    const levelOptions = [
        { value: 1, label: 'Cơ bản' },
        { value: 2, label: 'Trung bình' },
        { value: 3, label: 'Nâng cao' },
    ];

    const { data, mixinFuncs, queryFilter, loading, pagination, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.simulation.getList,
            delete: apiConfig.simulation.delete,
            update: apiConfig.simulation.update,
        },
        options: {
            objectName: 'simulation',
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
        },
        override: (funcs) => {
            const statusMap = {
                1: { label: 'Đang chờ duyệt', color: '#FFA500' },
                2: { label: 'Đã phê duyệt', color: '#00A648' },
                3: { label: 'Từ chối', color: '#CC0000' },
                4: { label: 'Yêu cầu xóa', color: '#FF6B6B' },
            };

            funcs.renderStatusColumn = (columnsProps) => ({
                title: labels.status,
                dataIndex: 'status',
                align: 'center',
                width: '140px',
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

            // Custom action buttons for Admin
            funcs.handleApprove = (id) => {
                Modal.confirm({
                    title: labels.confirmApprove,
                    onOk: async () => {
                        try {
                            await funcs.executeAction(apiConfig.simulation.approve, { id });
                            funcs.getList();
                        } catch (error) {
                            console.error('Approve error:', error);
                        }
                    },
                });
            };

            funcs.handleReject = (id) => {
                Modal.confirm({
                    title: labels.confirmReject,
                    onOk: async () => {
                        try {
                            await funcs.executeAction(apiConfig.simulation.reject, { id });
                            funcs.getList();
                        } catch (error) {
                            console.error('Reject error:', error);
                        }
                    },
                });
            };

            funcs.handleApproveDelete = (id) => {
                Modal.confirm({
                    title: labels.confirmApproveDelete,
                    onOk: async () => {
                        try {
                            await funcs.executeAction(apiConfig.simulation.approveDelete, { id });
                            funcs.getList();
                        } catch (error) {
                            console.error('Approve delete error:', error);
                        }
                    },
                });
            };

            funcs.handleRejectDelete = (id) => {
                Modal.confirm({
                    title: labels.confirmRejectDelete,
                    onOk: async () => {
                        try {
                            await funcs.executeAction(apiConfig.simulation.rejectDelete, { id });
                            funcs.getList();
                        } catch (error) {
                            console.error('Reject delete error:', error);
                        }
                    },
                });
            };

            const originalActionColumnButtons = funcs.actionColumnButtons;

            funcs.actionColumnButtons = (additionalButtons = {}) => ({
                ...originalActionColumnButtons(additionalButtons),
                viewTasks: ({ id }) => (
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/simulation/${id}/tasks`);
                        }}
                        style={{ padding: 0 }}
                        title={labels.viewTasks}
                    >
                        <EyeOutlined />
                    </Button>
                ),
                approve: ({ id }) => (
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            funcs.handleApprove(id);
                        }}
                        style={{ padding: 0, color: '#00A648' }}
                        title={labels.approve}
                    >
                        <CheckOutlined />
                    </Button>
                ),
                reject: ({ id }) => (
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            funcs.handleReject(id);
                        }}
                        style={{ padding: 0, color: '#CC0000' }}
                        title={labels.reject}
                    >
                        <CloseOutlined />
                    </Button>
                ),
                approveDelete: ({ id }) => (
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            funcs.handleApproveDelete(id);
                        }}
                        style={{ padding: 0, color: '#00A648' }}
                        title={labels.approveDelete}
                    >
                        <CheckOutlined />
                    </Button>
                ),
                rejectDelete: ({ id }) => (
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            funcs.handleRejectDelete(id);
                        }}
                        style={{ padding: 0, color: '#CC0000' }}
                        title={labels.rejectDelete}
                    >
                        <CloseOutlined />
                    </Button>
                ),
            });
        },
    });

    // Check user role
    const isAdmin = mixinFuncs.hasPermission([apiConfig.simulation.approve?.permissionCode]);
    const isEducator = mixinFuncs.hasPermission([apiConfig.simulation.create?.permissionCode]);

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
            width: '250px',
        },
        {
            title: labels.description,
            dataIndex: 'description',
            width: '300px',
            ellipsis: true,
        },
        {
            title: labels.level,
            dataIndex: 'level',
            align: 'center',
            width: '120px',
            render: (level) => {
                const levelItem = levelOptions.find(item => item.value === level);
                return levelItem?.label || level;
            },
        },
        {
            title: labels.educator,
            dataIndex: ['educator', 'fullName'],
            width: '150px',
        },
        {
            title: labels.totalEstimatedTime,
            dataIndex: 'totalEstimatedTime',
            align: 'center',
            width: '140px',
        },
        {
            title: labels.avgRating,
            dataIndex: 'avgRating',
            align: 'center',
            width: '100px',
            render: (rating) => rating ? rating.toFixed(1) : 'N/A',
        },
        mixinFuncs.renderStatusColumn(),
        mixinFuncs.renderActionColumn(
            (record) => {
                const actions = { viewTasks: true };

                if (isEducator && !isAdmin) {
                    // Educator can edit and request delete
                    if (record.status === 1 || record.status === 3) {
                        actions.edit = mixinFuncs.hasPermission([apiConfig.simulation.update.permissionCode]);
                    }
                    if (record.status === 2) {
                        actions.delete = mixinFuncs.hasPermission([apiConfig.simulation.delete.permissionCode]);
                    }
                }

                if (isAdmin) {
                    // Admin can approve/reject simulations and delete requests
                    if (record.status === 1) {
                        actions.approve = true;
                        actions.reject = true;
                    }
                    if (record.status === 4) {
                        actions.approveDelete = true;
                        actions.rejectDelete = true;
                    }
                }

                return actions;
            },
            {
                width: '180px',
            },
        ),
    ];

    const searchFields = [
        { 
            key: 'title', 
            placeholder: labels.title, 
        },
        {
            key: 'level',
            placeholder: labels.level,
            type: FieldTypes.SELECT,
            options: levelOptions,
        },
        {
            key: 'educatorId',
            placeholder: labels.educator,
            type: FieldTypes.AUTOCOMPLETE,
            apiConfig: apiConfig.educator?.autocomplete,
            mappingOptions: (item) => ({ value: item.id, label: item.fullName }),
        },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: queryFilter,
                })}
                actionBar={
                    isEducator && !isAdmin
                        ? mixinFuncs.renderActionBar()
                        : null
                }
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        rowKey={record => record.id}
                        pagination={pagination}
                        onRow={(record) => ({
                            onClick: () => {
                                if (isEducator) {
                                    navigate(`/simulation/${record.id}`);
                                }
                            },
                            style: { cursor: isEducator ? 'pointer' : 'default' },
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