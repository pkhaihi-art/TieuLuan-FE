// routes.js - Task Module Routes
import { commonMessage } from '@locales/intl';
import apiConfig from '@constants/apiConfig';
import TaskListPage from '@modules/task';
import TaskSavePage from '@modules/task/TaskSavePage';
import TaskQuestionListPage from '@modules/task/taskQuestion';
import TaskQuestionSavePage from '@modules/task/taskQuestion/TaskQuestionSavePage';

const paths = {
    taskListPage: '/simulation/:simulationId/task',
    taskSavePage: '/simulation/:simulationId/task/:id',
    taskQuestionListPage: '/simulation/:simulationId/task/:taskId/question',
    taskQuestionSavePage: '/simulation/:simulationId/task/:taskId/question/:id',
};

export default {
    taskListPage: {
        path: paths.taskListPage,
        auth: true,
        component: TaskListPage,
        permissions: [apiConfig.task.getList.permissionCode],
        pageOptions: {
            objectName: commonMessage.task,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: '/simulation' },
                    { breadcrumbName: t.formatMessage(commonMessage.task) },
                ];
            },
        },
    },
    taskSavePage: {
        path: paths.taskSavePage,
        auth: true,
        component: TaskSavePage,
        permissions: [apiConfig.task.create.permissionCode, apiConfig.task.update.permissionCode],
        pageOptions: {
            objectName: commonMessage.task,
            listPageUrl: paths.taskListPage,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: '/simulation' },
                    { breadcrumbName: t.formatMessage(commonMessage.task), path: `/simulation/${simulationId}/task` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    taskQuestionListPage: {
        path: paths.taskQuestionListPage,
        auth: true,
        component: TaskQuestionListPage,
        permissions: [apiConfig.taskQuestion.getList.permissionCode],
        pageOptions: {
            objectName: commonMessage.taskQuestion,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId, taskId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: '/simulation' },
                    { breadcrumbName: t.formatMessage(commonMessage.task), path: `/simulation/${simulationId}/task` },
                    { breadcrumbName: t.formatMessage(commonMessage.taskQuestion) },
                ];
            },
        },
    },
    taskQuestionSavePage: {
        path: paths.taskQuestionSavePage,
        auth: true,
        component: TaskQuestionSavePage,
        permissions: [apiConfig.taskQuestion.create.permissionCode, apiConfig.taskQuestion.update.permissionCode],
        pageOptions: {
            objectName: commonMessage.taskQuestion,
            listPageUrl: paths.taskQuestionListPage,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId, taskId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: '/simulation' },
                    { breadcrumbName: t.formatMessage(commonMessage.task), path: `/simulation/${simulationId}/task` },
                    { breadcrumbName: t.formatMessage(commonMessage.taskQuestion), path: `/simulation/${simulationId}/task/${taskId}/question` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
