import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import SimulationListPage from "@modules/simulation";
import SimulationSavePage from "@modules/simulation/SimulationSavePage";
import TaskListPage from "@modules/simulation/task/TaskListPage";
import TaskSavePage from "@modules/simulation/task/TaskSavePage";
import TaskQuestionListPage from "@modules/simulation/task/question/TaskQuestionListPage";
import TaskQuestionSavePage from "@modules/simulation/task/question/TaskQuestionSavePage";

const paths = {
    // Simulation paths
    simulationListPage: '/simulations',
    simulationSavePage: '/simulations/:id',
    
    // Task paths
    taskListPage: '/simulations/:simulationId/tasks',
    taskSavePage: '/simulations/:simulationId/tasks/:taskId',
    
    // Task Question paths
    taskQuestionListPage: '/simulations/:simulationId/tasks/:taskId/questions',
    taskQuestionSavePage: '/simulations/:simulationId/tasks/:taskId/questions/:questionId',
};

export default {
    // ============== SIMULATION ROUTES ==============
    simulationListPage: {
        path: paths.simulationListPage,
        auth: true,
        component: SimulationListPage,
        permissions: [apiConfig.simulation.getList.permissionCode],
        pageOptions: {
            objectName: commonMessage.simulation,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: 'Simulations' }];
            },
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
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: 'Simulations', path: paths.simulationListPage },
                    { breadcrumbName: title },
                ];
            },
        },
    },

    // ============== TASK ROUTES ==============
    taskListPage: {
        path: paths.taskListPage,
        auth: true,
        component: TaskListPage,
        permissions: [apiConfig.task.getList.permissionCode],
        pageOptions: {
            objectName: commonMessage.task,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: 'Simulations', path: paths.simulationListPage },
                    { breadcrumbName: 'Tasks' },
                ];
            },
        },
    },
    taskSavePage: {
        path: paths.taskSavePage,
        auth: true,
        component: TaskSavePage,
        permissions: [apiConfig.task.update.permissionCode],
        pageOptions: {
            objectName: commonMessage.task,
            listPageUrl: paths.taskListPage,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId } = options;
                return [
                    { breadcrumbName: 'Simulations', path: paths.simulationListPage },
                    { breadcrumbName: 'Tasks', path: `/simulation/${simulationId}/tasks` },
                    { breadcrumbName: title },
                ];
            },
        },
    },

    // ============== TASK QUESTION ROUTES ==============
    taskQuestionListPage: {
        path: paths.taskQuestionListPage,
        auth: true,
        component: TaskQuestionListPage,
        permissions: [apiConfig.taskQuestion.getList.permissionCode],
        pageOptions: {
            objectName: 'Question',
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId, taskId } = options;
                return [
                    { breadcrumbName: 'Simulations', path: paths.simulationListPage },
                    { breadcrumbName: 'Tasks', path: `/simulation/${simulationId}/tasks` },
                    { breadcrumbName: 'Questions' },
                ];
            },
        },
    },
    taskQuestionSavePage: {
        path: paths.taskQuestionSavePage,
        auth: true,
        component: TaskQuestionSavePage,
        permissions: [apiConfig.taskQuestion.update.permissionCode],
        pageOptions: {
            objectName: 'Question',
            listPageUrl: paths.taskQuestionListPage,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                const { simulationId, taskId } = options;
                return [
                    { breadcrumbName: 'Simulations', path: paths.simulationListPage },
                    { breadcrumbName: 'Tasks', path: `/simulation/${simulationId}/tasks` },
                    { breadcrumbName: 'Questions', path: `/simulation/${simulationId}/tasks/${taskId}/questions` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};