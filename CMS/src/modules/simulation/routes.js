// routes.js - Updated Simulation Routes với Task integration

import { commonMessage } from '@locales/intl';
import apiConfig from '@constants/apiConfig';
import SimulationListPage from '@modules/simulation/index';
import SimulationSavePage from '@modules/simulation/SimulationSavePage';
import EducatorSimulationListPage from "@modules/simulation/educator/EducatorSimulationListPage";
import EducatorSimulationSavePage from "@modules/simulation/educator/EducatorSimulationSavePage";

// Task imports
import TaskListPage from '@modules/task';
import TaskSavePage from '@modules/task/TaskSavePage';
import TaskQuestionListPage from '@modules/task/taskQuestion';
import TaskQuestionSavePage from '@modules/task/taskQuestion/TaskQuestionSavePage';

const paths = {
    // Simulation paths
    simulationListPage: '/simulation',
    simulationSavePage: '/simulation/:id',
    educatorSimulationListPage: '/educator-simulation',
    educatorSimulationSavePage: '/educator-simulation/:id',

    // Task paths - liên kết với Simulation
    taskListPage: '/simulation/:simulationId/task',
    taskSavePage: '/simulation/:simulationId/task/:id',
    taskQuestionListPage: '/simulation/:simulationId/task/:taskId/question',
    taskQuestionSavePage: '/simulation/:simulationId/task/:taskId/question/:id',

    // Educator Task paths
    educatorTaskListPage: '/educator-simulation/:simulationId/task',
    educatorTaskSavePage: '/educator-simulation/:simulationId/task/:id',
    educatorTaskQuestionListPage: '/educator-simulation/:simulationId/task/:taskId/question',
    educatorTaskQuestionSavePage: '/educator-simulation/:simulationId/task/:taskId/question/:id',
};

export default {
    simulationListPage: {
        path: paths.simulationListPage,
        auth: true,
        component: SimulationListPage,
        permissions: [apiConfig.simulation.getList.permissionCode],
        pageOptions: {
            objectName: commonMessage.simulation,
            renderBreadcrumbs: (messages, t = {}) => [
                { breadcrumbName: t.formatMessage(commonMessage.simulation) },
            ],
        },
    },
    simulationSavePage: {
        path: paths.simulationSavePage,
        auth: true,
        component: SimulationSavePage,
        permissions: [apiConfig.simulation.update.permissionCode],
        pageOptions: {
            objectName: commonMessage.simulation,
            listPageUrl: paths.simulationListPage,
            renderBreadcrumbs: (messages, t, title) => [
                { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.simulationListPage },
                { breadcrumbName: title },
            ],
        },
    },

    // ==================== TASK (Admin) ====================
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
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.simulationListPage },
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
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.simulationListPage },
                    { breadcrumbName: t.formatMessage(commonMessage.task), path: `/simulation/${simulationId}/task` },
                    { breadcrumbName: title },
                ];
            },
        },
    },

    // ==================== TASK QUESTION (Admin) ====================
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
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.simulationListPage },
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
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId, taskId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.simulationListPage },
                    { breadcrumbName: t.formatMessage(commonMessage.task), path: `/simulation/${simulationId}/task` },
                    { breadcrumbName: t.formatMessage(commonMessage.taskQuestion), path: `/simulation/${simulationId}/task/${taskId}/question` },
                    { breadcrumbName: title },
                ];
            },
        },
    },

    educatorSimulationListPage: {
        path: paths.educatorSimulationListPage,
        auth: true,
        component: EducatorSimulationListPage,
        permissions: [apiConfig.simulation.getListForEducator.permissionCode],
        pageOptions: {
            objectName: commonMessage.simulation,
            renderBreadcrumbs: (messages, t = {}) => [
                { breadcrumbName: t.formatMessage(commonMessage.simulation) },
            ],
        },
    },
    educatorSimulationSavePage: {
        path: paths.educatorSimulationSavePage,
        auth: true,
        component: EducatorSimulationSavePage,
        permissions: [apiConfig.simulation.update.permissionCode],
        pageOptions: {
            objectName: commonMessage.simulation,
            listPageUrl: paths.educatorSimulationListPage,
            renderBreadcrumbs: (messages, t, title) => [
                { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.educatorSimulationListPage },
                { breadcrumbName: title },
            ],
        },
    },

    // ==================== EDUCATOR TASK ====================
    educatorTaskListPage: {
        path: paths.educatorTaskListPage,
        auth: true,
        component: TaskListPage,
        permissions: [apiConfig.task.educatorList.permissionCode],
        pageOptions: {
            objectName: commonMessage.task,
            isEducator: true,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.educatorSimulationListPage },
                    { breadcrumbName: t.formatMessage(commonMessage.task) },
                ];
            },
        },
    },
    educatorTaskSavePage: {
        path: paths.educatorTaskSavePage,
        auth: true,
        component: TaskSavePage,
        permissions: [apiConfig.task.create.permissionCode, apiConfig.task.update.permissionCode],
        pageOptions: {
            objectName: commonMessage.task,
            isEducator: true,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.educatorSimulationListPage },
                    { breadcrumbName: t.formatMessage(commonMessage.task), path: `/educator-simulation/${simulationId}/task` },
                    { breadcrumbName: title },
                ];
            },
        },
    },

    // ==================== EDUCATOR TASK QUESTION ====================
    educatorTaskQuestionListPage: {
        path: paths.educatorTaskQuestionListPage,
        auth: true,
        component: TaskQuestionListPage,
        permissions: [apiConfig.taskQuestion.educatorList.permissionCode],
        pageOptions: {
            objectName: commonMessage.taskQuestion,
            isEducator: true,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId, taskId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.educatorSimulationListPage },
                    { breadcrumbName: t.formatMessage(commonMessage.task), path: `/educator-simulation/${simulationId}/task` },
                    { breadcrumbName: t.formatMessage(commonMessage.taskQuestion) },
                ];
            },
        },
    },
    educatorTaskQuestionSavePage: {
        path: paths.educatorTaskQuestionSavePage,
        auth: true,
        component: TaskQuestionSavePage,
        permissions: [apiConfig.taskQuestion.create.permissionCode, apiConfig.taskQuestion.update.permissionCode],
        pageOptions: {
            objectName: commonMessage.taskQuestion,
            isEducator: true,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId, taskId } = options;
                return [
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.educatorSimulationListPage },
                    { breadcrumbName: t.formatMessage(commonMessage.task), path: `/educator-simulation/${simulationId}/task` },
                    { breadcrumbName: t.formatMessage(commonMessage.taskQuestion), path: `/educator-simulation/${simulationId}/task/${taskId}/question` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
