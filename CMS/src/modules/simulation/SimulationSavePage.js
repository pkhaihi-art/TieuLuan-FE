import React from 'react';
import { useParams } from 'react-router-dom';

import PageWrapper from '@components/common/layout/PageWrapper';

import apiConfig from '@constants/apiConfig';
import { levelOptions } from '@constants/masterData';

import useFetch from '@hooks/useFetch';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';

import { commonMessage } from '@locales/intl';
import SimulationForm from "@modules/simulation/SimulationForm";

const SimulationSavePage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { id } = useParams();

    // Fetch specializations for the dropdown select field
    const { data: specializations } = useFetch(apiConfig.specialization.getList, {
        immediate: true,
        mappingData: (res) => res.data?.content?.map((item) => ({ 
            id: item.id,
            name: item.name,
        })),
    });

    // Translate level options for the dropdown
    const levels = translate.formatKeys(levelOptions, ['label']);

    const { detail, mixinFuncs, loading, onSave, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.simulation.getById,
            create: apiConfig.simulation.create,
            update: apiConfig.simulation.update,
        },
        options: {
            getListUrl: pageOptions.listPageUrl,
            objectName: translate.formatMessage(commonMessage.simulation)?.toLowerCase(),
        },
        override: (funcs) => {
            // Prepare data for updating an existing simulation
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: id,
                };
            };
            // Prepare data for creating a new simulation
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                };
            };
            // Map the response from getById to fit the form structure
            funcs.mappingData = (data) => {
                return {
                    ...data.data,
                };
            };
        },
    });

    return (
        <PageWrapper loading={loading} routes={pageOptions.renderBreadcrumbs(commonMessage, translate, title)}>
            <SimulationForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail || {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={onSave}
                specializations={specializations || []}
                levels={levels || []}
            />
        </PageWrapper>
    );
};

export default SimulationSavePage;
