import React, { useEffect } from 'react';
import { Card, Col, Row } from 'antd';

import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import RichTextField from '@components/common/form/RichTextField';
import SelectField from '@components/common/form/SelectField';
import NumericField from '@components/common/form/NumericField';

import useBasicForm from '@hooks/useBasicForm';
import useTranslate from '@hooks/useTranslate';

import { commonMessage } from '@locales/intl';
import { statusOptions } from '@constants/masterData';

const TaskForm = (props) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const {
        formId,
        actions,
        dataDetail,
        onSubmit,
        setIsChangedFormValues,
        isEditing,
    } = props;

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit(values);
    };

    useEffect(() => {
        if (dataDetail) {
            form.setFieldsValue({
                name: dataDetail.name,
                description: dataDetail.description,
                orderSort: dataDetail.orderSort,
                status: dataDetail.status,
            });
        }
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
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
                        <NumericField
                            label={translate.formatMessage(commonMessage.orderSort)}
                            name="orderSort"
                            min={0}
                            defaultValue={0}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <RichTextField
                            label={translate.formatMessage(commonMessage.description)}
                            name="description"
                            style={{ height: 300 }}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <SelectField
                            options={statusValues}
                            name="status"
                            required
                            requiredMsg={translate.formatMessage(commonMessage.required)}
                            label={translate.formatMessage(commonMessage.status)}
                            allowClear={false}
                        />
                    </Col>
                </Row>

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default TaskForm;