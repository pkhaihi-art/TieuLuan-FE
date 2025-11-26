
import { commonMessage } from '@locales/intl';
import apiConfig from '@constants/apiConfig';
import SimulationCreatePage from '@modules/simulation/index';
import SimulationSavePage from '@modules/simulation/SimulationSavePage';

const paths = {
    simulationListPage: '/simulation',
    simulationSavePage: '/simulation/:id',
};

export default {
    simulationListPage: {
        path: paths.simulationListPage,
        auth: true,
        component: SimulationCreatePage,
        permissions: [apiConfig.simulation.getList.permissionCode],
        pageOptions: {
            objectName: commonMessage.simulation,
            renderBreadcrumbs: (messages, t = {}) => {
                return [{ breadcrumbName: t.formatMessage(commonMessage.simulation) }];
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
                    { breadcrumbName: t.formatMessage(commonMessage.simulation), path: paths.simulationListPage },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
