import React from 'react';
import { Empty, Tag, Button } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, CheckCircleOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons';
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

import { UserTypes } from '@constants';
import { getData } from '@utils/localStorage';
import { storageKeys } from '@constants';
import { calculateIndex } from '@utils';

// Định nghĩa các status constants
const STATUS_ACTIVE = 1;
const STATUS_PENDING = 0;
const STATUS_WAITING_APPROVE = 2;
const STATUS_WAITING_APPROVE_DELETE = 3;
const STATUS_LOCK = -1;
const STATUS_REJECT = -2;

const SimulationListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const navigate = useNavigate();
    
    // Tự động phát hiện user type
    const userType = getData(storageKeys.USER_TYPE);
    const isEducator = userType === UserTypes.EDUCATOR;

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

    // Khởi tạo hooks
    const { execute: executeApprove } = useFetch(apiConfig.simulation.approve);
    const { execute: executeApproveDelete } = useFetch(apiConfig.simulation.approveDelete);
    const { execute: executeReject } = useFetch(apiConfig.simulation.reject);
    const { execute: executeRejectDelete } = useFetch(apiConfig.simulation.rejectDelete);
    const { execute: executeRequestDelete } = useFetch(apiConfig.simulation.requestDelete);

    // Cấu hình API theo role
    const apiConfiguration = isEducator
        ?   {
            create: apiConfig.simulation.create,
            getList: apiConfig.simulation.getListForEducator,
            update: apiConfig.simulation.update,
            changeStatus: apiConfig.simulation.changeStatus,
            requestDelete: apiConfig.simulation.requestDelete,
        }
        : {
            getList: apiConfig.simulation.getList,
            changeStatus: null,
            approve: apiConfig.simulation.approve,
            approveDelete: apiConfig.simulation.approveDelete,
            reject: apiConfig.simulation.reject,
            rejectDelete: apiConfig.simulation.rejectDelete,
        };

    const { data, mixinFuncs, queryFilter, loading, pagination, setData, setLoading } = useListBase({
        apiConfig: apiConfiguration,
        options: {
            objectName: labels.simulation,
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
        },
        override: (funcs) => {
            // Hàm xử lý cho Admin
            if (!isEducator) {
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
                                    message: `Phê duyệt ${labels.simulation} thành công${message ? ': ' + message : ''}`,
                                });

                                setData((prevData) =>
                                    prevData.map((item) => (item.id === id ? { ...item, status: STATUS_ACTIVE } : item)),
                                );
                            } else {
                                mixinFuncs.notification({
                                    type: 'error',
                                    message: `Phê duyệt ${labels.simulation} chưa thành công${message ? ': ' + message : ''}`,
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
                                    message: `Phê duyệt xoá ${labels.simulation} thành công${message ? ': ' + message : ''}`,
                                });

                                // Xóa item khỏi danh sách sau khi phê duyệt xóa
                                setData((prevData) => prevData.filter((item) => item.id !== id));
                            } else {
                                mixinFuncs.notification({
                                    type: 'error',
                                    message: `Phê duyệt xoá ${labels.simulation} chưa thành công${message ? ': ' + message : ''}`,
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

                funcs.handleReject = (id) => {
                    if (!apiConfig.simulation.reject) return;

                    setLoading(true);

                    executeReject({
                        data: { id },
                        onCompleted: (response) => {
                            const { result, message } = response.data;
                            if (result === true) {
                                mixinFuncs.notification({
                                    type: 'success',
                                    message: `Từ chối ${labels.simulation} thành công${message ? ': ' + message : ''}`,
                                });

                                setData((prevData) =>
                                    prevData.map((item) => (item.id === id ? { ...item, status: STATUS_REJECT } : item)),
                                );
                            } else {
                                mixinFuncs.notification({
                                    type: 'error',
                                    message: `Từ chối ${labels.simulation} chưa thành công${message ? ': ' + message : ''}`,
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

                funcs.handleRejectDelete = (id) => {
                    if (!apiConfig.simulation.rejectDelete) return;

                    setLoading(true);

                    executeRejectDelete({
                        pathParams: { id },
                        onCompleted: (response) => {
                            const { result, message } = response.data;
                            if (result === true) {
                                mixinFuncs.notification({
                                    type: 'success',
                                    message: `Từ chối xoá ${labels.simulation} thành công${message ? ': ' + message : ''}`,
                                });

                                // Cập nhật status về trạng thái trước đó (giả sử là ACTIVE)
                                setData((prevData) =>
                                    prevData.map((item) => (item.id === id ? { ...item, status: STATUS_ACTIVE } : item)),
                                );
                            } else {
                                mixinFuncs.notification({
                                    type: 'error',
                                    message: `Từ chối xoá ${labels.simulation} chưa thành công${message ? ': ' + message : ''}`,
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
            }

            // Hàm xử lý cho Educator
            if (isEducator) {
                funcs.handleRequestDelete = (id) => {
                    if (!apiConfig.simulation.requestDelete) return;

                    setLoading(true);

                    executeRequestDelete({
                        pathParams: { id },
                        onCompleted: (response) => {
                            const { result, message } = response.data;
                            if (result === true) {
                                mixinFuncs.notification({
                                    type: 'success',
                                    message: `Yêu cầu xoá ${labels.simulation} thành công${message ? ': ' + message : ''}`,
                                });

                                // Cập nhật status thành WAITING_APPROVE_DELETE
                                setData((prevData) =>
                                    prevData.map((item) => (item.id === id ? { ...item, status: STATUS_WAITING_APPROVE_DELETE } : item)),
                                );
                            } else {
                                mixinFuncs.notification({
                                    type: 'error',
                                    message: `Yêu cầu xoá ${labels.simulation} chưa thành công${message ? ': ' + message : ''}`,
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
            }

            // Override action column buttons
            const originalActionColumnButtons = funcs.actionColumnButtons;
            funcs.actionColumnButtons = (additionalButtons = {}) => {
                const buttons = {
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
                };

                if (isEducator) {
                    // Nút Request Delete cho Educator
                    buttons.requestDelete = ({ id, status, buttonProps }) => (
                        <Button
                            {...buttonProps}
                            type="link"
                            style={{ padding: 0, color: '#fa8c16' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                funcs.handleRequestDelete(id);
                            }}
                            title="Yêu cầu xoá"
                        >
                            <DeleteOutlined />
                        </Button>
                    );
                } else {
                    // Nút Approve: hiển thị khi status = STATUS_WAITING_APPROVE (2)
                    buttons.approve = ({ id, status, buttonProps }) =>
                        status === STATUS_WAITING_APPROVE ? (
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
                        ) : null;

                    // Nút Reject: hiển thị khi status = STATUS_WAITING_APPROVE (2)
                    buttons.reject = ({ id, status, buttonProps }) =>
                        status === STATUS_WAITING_APPROVE ? (
                            <Button
                                {...buttonProps}
                                type="link"
                                style={{ padding: 0, color: '#ff4d4f' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    funcs.handleReject(id);
                                }}
                                title="Từ chối"
                            >
                                <CloseCircleOutlined />
                            </Button>
                        ) : null;

                    // Nút Approve Delete: hiển thị khi status = STATUS_WAITING_APPROVE_DELETE (3)
                    buttons.approveDelete = ({ id, status, buttonProps }) =>
                        status === STATUS_WAITING_APPROVE_DELETE ? (
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
                        ) : null;

                    // Nút Reject Delete: hiển thị khi status = STATUS_WAITING_APPROVE_DELETE (3)
                    buttons.rejectDelete = ({ id, status, buttonProps }) =>
                        status === STATUS_WAITING_APPROVE_DELETE ? (
                            <Button
                                {...buttonProps}
                                type="link"
                                style={{ padding: 0, color: '#ff4d4f' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    funcs.handleRejectDelete(id);
                                }}
                                title="Từ chối xoá"
                            >
                                <CloseCircleOutlined />
                            </Button>
                        ) : null;
                }

                return buttons;
            };

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
            render: (imagePath) => (
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
        // // Hiển thị description cho Admin
        // ...(isEducator
        //     ? []
        //     : [
        //         {
        //             title: translate.formatMessage(commonMessage.description),
        //             dataIndex: 'description',
        //             width: '250px',
        //             ellipsis: true,
        //         },
        //     ]),
        // {
        //     title: labels.level,
        //     dataIndex: 'level',
        //     align: 'center',
        //     width: '120px',
        //     render: (level) => levelMap[level]?.label || 'N/A',
        // },
        // Hiển thị specialization cho Admin
        ...(isEducator
            ? []
            : [
                {
                    title: labels.specialization,
                    dataIndex: ['specialization', 'name'],
                    align: 'center',
                    width: '150px',
                },
            ]),
        // {
        //     title: translate.formatMessage(commonMessage.totalEstimatedTime),
        //     dataIndex: 'totalEstimatedTime',
        //     width: isEducator ? '160px' : '140px',
        // },
        mixinFuncs.renderStatusColumn({ width: '120px' }),
        mixinFuncs.renderActionColumn(
            isEducator
                ? {
                    edit: () => mixinFuncs.hasPermission([apiConfig.simulation.update.permissionCode]),
                    task: () => mixinFuncs.hasPermission([apiConfig.task.educatorList.permissionCode]),
                    requestDelete: () => mixinFuncs.hasPermission([apiConfig.simulation.requestDelete.permissionCode]),
                }
                : {
                    edit: () => mixinFuncs.hasPermission([apiConfig.simulation.update.permissionCode]),
                    task: () => mixinFuncs.hasPermission([apiConfig.task.getList.permissionCode]),
                    approve: (dataRow) => dataRow.status === STATUS_WAITING_APPROVE,
                    reject: (dataRow) => dataRow.status === STATUS_WAITING_APPROVE,
                    approveDelete: (dataRow) => dataRow.status === STATUS_WAITING_APPROVE_DELETE,
                    rejectDelete: (dataRow) => dataRow.status === STATUS_WAITING_APPROVE_DELETE,
                },
            { width: isEducator ? '150px' : '220px', title: labels.action },
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
                actionBar={isEducator ? mixinFuncs.renderActionBar() : null}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        rowKey={(record) => record.id}
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