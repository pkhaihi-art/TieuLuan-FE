import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Empty, Tag, Button } from 'antd';
import { PlusOutlined, FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';

import { AppConstants, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import { taskKindOptions } from '@constants/masterData';
import { commonMessage } from '@locales/intl';

import AvatarField from '@components/common/form/AvatarField';
import BaseTable from '@components/common/table/BaseTable';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';

import { calculateIndex } from '@utils';

const TaskListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const { simulationId } = useParams();

    const formattedKindOptions = translate.formatKeys(taskKindOptions, ['label']);
    const kindMap = Object.fromEntries(formattedKindOptions.map(item => [item.value, item]));

    const labels = {
        name: translate.formatMessage(commonMessage.name),
        title: translate.formatMessage(commonMessage.title),
        description: translate.formatMessage(commonMessage.description),
        introduction: translate.formatMessage(commonMessage.introduction),
        kind: translate.formatMessage(commonMessage.kind),
        totalQuestion: translate.formatMessage(commonMessage.totalQuestion),
        maxErrors: translate.formatMessage(commonMessage.maxErrors),
        noData: translate.formatMessage(commonMessage.noData),
        action: translate.formatMessage(commonMessage.action),
        task: translate.formatMessage(commonMessage.task),
        image: translate.formatMessage(commonMessage.image),
        question: translate.formatMessage(commonMessage.question),
    };

    const kindValues = formattedKindOptions.map(item => ({
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
            objectName: labels.task,
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
        },
        override: (funcs) => {
            funcs.prepareGetListParams = (params) => ({
                ...params,
                simulationId: simulationId,
            });

            funcs.renderKindColumn = (columnsProps) => ({
                title: labels.kind,
                dataIndex: 'kind',
                align: 'center',
                ...columnsProps,
                render: (kind) => {
                    const item = kindMap[kind] || {};
                    return (
                        <Tag color={item.color || 'default'}>
                            <div style={{ padding: '0 4px', fontSize: 14 }}>{item.label || 'N/A'}</div>
                        </Tag>
                    );
                },
            });

            const originalActionColumnButtons = funcs.actionColumnButtons;
            funcs.actionColumnButtons = (additionalButtons = {}) => ({
                ...originalActionColumnButtons(additionalButtons),
                question: ({ id }) => (
                    <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/simulation/${simulationId}/task/${id}/question`);
                        }}
                        title={labels.question}
                    >
                        <QuestionCircleOutlined />
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
            title: labels.image,
            dataIndex: 'imagePath',
            align: 'center',
            width: '80px',
            render: imagePath => (
                <AvatarField
                    size="large"
                    icon={<FileTextOutlined />}
                    src={imagePath ? `${AppConstants.contentRootUrl}${imagePath}` : null}
                    shape="square"
                />
            ),
        },
        {
            title: labels.name,
            dataIndex: 'name',
            width: '180px',
        },
        {
            title: labels.title,
            dataIndex: 'title',
            width: '200px',
        },
        {
            title: labels.description,
            dataIndex: 'description',
            width: '250px',
            ellipsis: true,
        },
        mixinFuncs.renderKindColumn({ width: '120px' }),
        {
            title: labels.totalQuestion,
            dataIndex: 'totalQuestion',
            align: 'center',
            width: '120px',
        },
        {
            title: labels.maxErrors,
            dataIndex: 'maxErrors',
            align: 'center',
            width: '100px',
        },
        mixinFuncs.renderActionColumn(
            {
                edit: () => mixinFuncs.hasPermission([apiConfig.task.update.permissionCode]),
                delete: () => mixinFuncs.hasPermission([apiConfig.task.delete.permissionCode]),
                question: () => mixinFuncs.hasPermission([apiConfig.taskQuestion.getList.permissionCode]),
            },
            { width: '150px', title: labels.action },
        ),
    ];

    const searchFields = [
        { key: 'name', placeholder: labels.name },
        { key: 'title', placeholder: labels.title },
        {
            key: 'kind',
            placeholder: labels.kind,
            type: FieldTypes.SELECT,
            options: kindValues,
        },
    ];

    const handleCreateClick = () => {
        navigate(`/simulation/${simulationId}/task/create`);
    };

    return (
        <PageWrapper
            routes={pageOptions.renderBreadcrumbs(commonMessage, translate, null, { simulationId })}
        >
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: queryFilter,
                })}
                actionBar={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClick}>
                        {translate.formatMessage(commonMessage.create)}
                    </Button>
                }
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

export default TaskListPage;
