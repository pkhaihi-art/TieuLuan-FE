import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';

import { BaseForm } from '@components/common/form/BaseForm';
import CropImageField from '@components/common/form/CropImageField';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';
import RichTextField from '@components/common/form/RichTextField';
import NumericField from '@components/common/form/NumericField';

import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';

import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import { taskKindOptions } from '@constants/masterData';
import { commonMessage } from '@locales/intl';

const TaskForm = (props) => {
    const translate = useTranslate();
    const kindValues = translate.formatKeys(taskKindOptions, ['label']);

    const {
        formId,
        actions,
        dataDetail,
        onSubmit,
        setIsChangedFormValues,
        isEditing,
        simulationId,
    } = props;

    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [imageUrl, setImageUrl] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const uploadFile = (file, onSuccess, onError, type = 'AVATAR') => {
        executeUpFile({
            data: { type, file },
            onCompleted: (response) => {
                if (response.result === true) {
                    onSuccess();
                    if (type === 'AVATAR') setImageUrl(response.data.filePath);
                    else if (type === 'VIDEO') setVideoUrl(response.data.filePath);
                    else setFileUrl(response.data.filePath);
                    setIsChangedFormValues(true);
                }
            },
            onError,
        });
    };

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({
            ...values,
            imagePath: imageUrl,
            videoPath: videoUrl,
            filePath: fileUrl,
            simulationId: simulationId,
        });
    };

    useEffect(() => {
        if (dataDetail) {
            form.setFieldsValue({
                name: dataDetail?.name,
                title: dataDetail?.title,
                description: dataDetail?.description,
                introduction: dataDetail?.introduction,
                content: dataDetail?.content,
                kind: dataDetail?.kind,
                maxErrors: dataDetail?.maxErrors,
                parentId: dataDetail?.parentId,
            });
            setImageUrl(dataDetail?.imagePath);
            setVideoUrl(dataDetail?.videoPath);
            setFileUrl(dataDetail?.filePath);
        }
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={16}>
                    <Col span={12}>
                        <CropImageField
                            label={translate.formatMessage(commonMessage.image)}
                            name="imagePath"
                            imageUrl={imageUrl && `${AppConstants.contentRootUrl}${imageUrl}`}
                            aspect={16 / 9}
                            uploadFile={(file, onSuccess, onError) => uploadFile(file, onSuccess, onError, 'AVATAR')}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.name)}
                            required
                            name="name"
                            requiredMsg={translate.formatMessage(commonMessage.required)}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.title)}
                            required
                            name="title"
                            requiredMsg={translate.formatMessage(commonMessage.required)}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <SelectField
                            label={translate.formatMessage(commonMessage.kind)}
                            required
                            name="kind"
                            requiredMsg={translate.formatMessage(commonMessage.required)}
                            options={kindValues}
                            allowClear={false}
                        />
                    </Col>
                    <Col span={12}>
                        <NumericField
                            label={translate.formatMessage(commonMessage.maxErrors)}
                            name="maxErrors"
                            min={0}
                            max={100}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.introduction)}
                            name="introduction"
                            type="textarea"
                            rows={3}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.description)}
                            name="description"
                            type="textarea"
                            rows={3}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <RichTextField
                            label={translate.formatMessage(commonMessage.content)}
                            name="content"
                            style={{ height: 300 }}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.videoPath)}
                            name="videoPathInput"
                            placeholder="URL video hoặc upload"
                            addonAfter={
                                <span
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {/* Handle video upload */}}
                                >
                                    Upload
                                </span>
                            }
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label={translate.formatMessage(commonMessage.filePath)}
                            name="filePathInput"
                            placeholder="URL file hoặc upload"
                        />
                    </Col>
                </Row>

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default TaskForm;
