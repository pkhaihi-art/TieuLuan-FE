import React from 'react';
import { useParams } from 'react-router-dom';

import PageWrapper from '@components/common/layout/PageWrapper';

import { STATUS_ACTIVE } from '@constants';
import apiConfig from '@constants/apiConfig';

import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';

import { commonMessage } from '@locales/intl';
import TaskForm from "@modules/simulation/task/TaskForm";

const TaskSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { simulationId, taskId } = useParams();

    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.task.getById,
            create: apiConfig.task.create,
            update: apiConfig.task.update,
        },
        options: {
            getListUrl: pageOptions.listPageUrl.replace(':simulationId', simulationId),
            objectName: translate.formatMessage(commonMessage.task)?.toLowerCase(),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: taskId,
                    simulationId: simulationId,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    simulationId: simulationId,
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
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title, { simulationId })}>
            <TaskForm
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

export default TaskSavePage;