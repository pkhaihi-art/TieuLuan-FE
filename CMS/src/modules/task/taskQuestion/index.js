import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Empty, Tag, Button, Tooltip } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';

import useListBase from '@hooks/useListBase';
import useTranslate from '@hooks/useTranslate';

import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { FieldTypes } from '@constants/formConfig';
import { questionTypeOptions } from '@constants/masterData';
import { commonMessage } from '@locales/intl';

import BaseTable from '@components/common/table/BaseTable';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';

import { calculateIndex } from '@utils';

const TaskQuestionListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const { simulationId, taskId } = useParams();

    const formattedQuestionTypeOptions = translate.formatKeys(questionTypeOptions, ['label']);
    const questionTypeMap = Object.fromEntries(
        formattedQuestionTypeOptions.map(item => [item.value, item]),
    );

    const labels = {
        question: translate.formatMessage(commonMessage.question),
        options: translate.formatMessage(commonMessage.options),
        questionType: translate.formatMessage(commonMessage.questionType),
        noData: translate.formatMessage(commonMessage.noData),
        action: translate.formatMessage(commonMessage.action),
        taskQuestion: translate.formatMessage(commonMessage.taskQuestion),
    };

    const questionTypeValues = formattedQuestionTypeOptions.map(item => ({
        value: item.value,
        label: item.label,
    }));

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: {
            getList: apiConfig.taskQuestion.getList,
            delete: apiConfig.taskQuestion.delete,
            update: apiConfig.taskQuestion.update,
        },
        options: {
            objectName: labels.taskQuestion,
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
        },
        override: (funcs) => {
            funcs.prepareGetListParams = (params) => ({
                ...params,
                simulationId: simulationId,
                taskId: taskId,
            });

            funcs.renderQuestionTypeColumn = (columnsProps) => ({
                title: labels.questionType,
                dataIndex: 'questionType',
                align: 'center',
                ...columnsProps,
                render: (type) => {
                    const item = questionTypeMap[type] || {};
                    return (
                        <Tag color={item.color || 'blue'}>
                            <div style={{ padding: '0 4px', fontSize: 14 }}>{item.label || 'N/A'}</div>
                        </Tag>
                    );
                },
            });
        },
    });

    // Parse options JSON để hiển thị
    const parseOptions = (optionsStr) => {
        try {
            const options = JSON.parse(optionsStr);
            if (Array.isArray(options)) {
                return options.map((opt, idx) => (
                    <div key={idx} style={{ marginBottom: 2 }}>
                        <Tag color={opt.isCorrect ? 'green' : 'default'}>
                            {opt.content || opt.text || opt}
                        </Tag>
                    </div>
                ));
            }
            return optionsStr;
        } catch {
            return optionsStr;
        }
    };

    const columns = [
        {
            title: '#',
            width: '40px',
            align: 'center',
            render: (_, __, index) => calculateIndex(index, pagination, queryFilter),
        },
        {
            title: labels.question,
            dataIndex: 'question',
            width: '350px',
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text}</span>
                </Tooltip>
            ),
        },
        {
            title: labels.options,
            dataIndex: 'options',
            width: '300px',
            render: (options) => (
                <div style={{ maxHeight: 100, overflow: 'auto' }}>
                    {parseOptions(options)}
                </div>
            ),
        },
        mixinFuncs.renderQuestionTypeColumn({ width: '150px' }),
        mixinFuncs.renderActionColumn(
            {
                edit: () => mixinFuncs.hasPermission([apiConfig.taskQuestion.update.permissionCode]),
                delete: () => mixinFuncs.hasPermission([apiConfig.taskQuestion.delete.permissionCode]),
            },
            { width: '120px', title: labels.action },
        ),
    ];

    const searchFields = [
        { key: 'question', placeholder: labels.question },
        {
            key: 'questionType',
            placeholder: labels.questionType,
            type: FieldTypes.SELECT,
            options: questionTypeValues,
        },
    ];

    const handleCreateClick = () => {
        navigate(`/simulation/${simulationId}/task/${taskId}/question/create`);
    };

    return (
        <PageWrapper
            routes={pageOptions.renderBreadcrumbs(commonMessage, translate, null, { simulationId, taskId })}
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

export default TaskQuestionListPage;
