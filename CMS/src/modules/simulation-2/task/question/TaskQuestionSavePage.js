import React from 'react';
import { useParams } from 'react-router-dom';

import PageWrapper from '@components/common/layout/PageWrapper';

import { STATUS_ACTIVE } from '@constants';
import apiConfig from '@constants/apiConfig';

import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';

import { commonMessage } from '@locales/intl';
import TaskQuestionForm from "@modules/simulation/task/question/TaskQuestionForm";

const TaskQuestionSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { simulationId, taskId, questionId } = useParams();

    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.taskQuestion.getById,
            create: apiConfig.taskQuestion.create,
            update: apiConfig.taskQuestion.update,
        },
        options: {
            getListUrl: pageOptions.listPageUrl
                .replace(':simulationId', simulationId)
                .replace(':taskId', taskId),
            objectName: 'question',
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: questionId,
                    taskId: taskId,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    taskId: taskId,
                    status: data.status || STATUS_ACTIVE,
                };
            };
            funcs.mappingData = (data) => {
                return {
                    ...data.data,
                };
            };
        },
    });

    return (
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title, { simulationId, taskId })}>
            <TaskQuestionForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail || {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={onSave}
            />
        </PageWrapper>
    );
};

export default TaskQuestionSavePage;