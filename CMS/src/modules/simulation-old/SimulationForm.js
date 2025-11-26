import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';

import { BaseForm } from '@components/common/form/BaseForm';
import CropImageField from '@components/common/form/CropImageField';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';

import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import FileUploadField from '@components/common/form/FileUploadField';
import AutoCompleteField from '@components/common/form/AutoCompleteField';

const SimulationForm = (props) => {
    const {
        formId,
        actions,
        dataDetail,
        onSubmit,
        setIsChangedFormValues,
        specializations,
        levels,
        isEditing,
    } = props;

    const translate = useTranslate();
    const [imagePath, setImagePath] = useState(null);
    const [videoPath, setVideoPath] = useState(null);
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload, { immediate: false });

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    // Handle file uploads (both image and video)
    const uploadFile = (file, onSuccess, onError, type) => {
        executeUpFile({
            data: { file, type }, // type can be 'SIMULATION_IMAGE' or 'SIMULATION_VIDEO'
            onCompleted: (response) => {
                if (response.result === true) {
                    onSuccess();
                    if (type === 'SIMULATION_IMAGE') {
                        setImagePath(response.data.filePath);
                        form.setFieldsValue({ imagePath: response.data.filePath });
                    } else if (type === 'SIMULATION_VIDEO') {
                        setVideoPath(response.data.filePath);
                        form.setFieldsValue({ videoPath: response.data.filePath });
                    }
                    setIsChangedFormValues(true);
                }
            },
            onError,
        });
    };

    // Populate form with data when editing
    useEffect(() => {
        if (dataDetail.id) {
            form.setFieldsValue({
                ...dataDetail,
            });
            setImagePath(dataDetail.imagePath);
            setVideoPath(dataDetail.videoPath);
        }
    }, [dataDetail]);

    // Handle form submission
    const handleSubmit = (values) => {
        mixinFuncs.handleSubmit({
            ...values,
            imagePath: imagePath,
            videoPath: videoPath,
        });
    };

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={16}>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.title)}
                            name="title"
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            label={translate.formatMessage(commonMessage.specialization)}
                            name="name"
                            options={specializations}
                            required
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <SelectField
                            label={translate.formatMessage(commonMessage.level)}
                            name="level"
                            options={levels}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.totalEstimatedTime)}
                            name="totalEstimatedTime"
                            placeholder="e.g., 30 minutes"
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.overview)}
                            name="overview"
                            required
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.description)}
                            name="description"
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <CropImageField
                            label={translate.formatMessage(commonMessage.image)}
                            name="imagePath"
                            imageUrl={imagePath && `${AppConstants.contentRootUrl}${imagePath}`}
                            aspect={16 / 9}
                            uploadFile={(file, onSuccess, onError) =>
                                uploadFile(file, onSuccess, onError, 'SIMULATION_IMAGE')}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <FileUploadField
                            label={translate.formatMessage(commonMessage.video)}
                            name="videoPath"
                            filePath={videoPath}
                            uploadFile={(file, onSuccess, onError) =>
                                uploadFile(file, onSuccess, onError, 'SIMULATION_VIDEO')}
                            required
                        />
                    </Col>
                </Row>

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default SimulationForm;
