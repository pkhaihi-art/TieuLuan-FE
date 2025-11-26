import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Space, Checkbox, Input, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import { BaseForm } from '@components/common/form/BaseForm';
import SelectField from '@components/common/form/SelectField';
import TextField from '@components/common/form/TextField';

import useBasicForm from '@hooks/useBasicForm';
import useTranslate from '@hooks/useTranslate';

import { questionTypeOptions } from '@constants/masterData';
import { commonMessage } from '@locales/intl';

const TaskQuestionForm = (props) => {
    const translate = useTranslate();
    const questionTypeValues = translate.formatKeys(questionTypeOptions, ['label']);

    const {
        formId,
        actions,
        dataDetail,
        onSubmit,
        setIsChangedFormValues,
        isEditing,
        taskId,
    } = props;

    const [options, setOptions] = useState([
        { id: 1, content: '', isCorrect: false },
        { id: 2, content: '', isCorrect: false },
    ]);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const addOption = () => {
        const newId = Math.max(...options.map(o => o.id), 0) + 1;
        setOptions([...options, { id: newId, content: '', isCorrect: false }]);
        setIsChangedFormValues(true);
    };

    const removeOption = (id) => {
        if (options.length > 2) {
            setOptions(options.filter(opt => opt.id !== id));
            setIsChangedFormValues(true);
        }
    };

    const updateOption = (id, field, value) => {
        setOptions(options.map(opt =>
            opt.id === id ? { ...opt, [field]: value } : opt,
        ));
        setIsChangedFormValues(true);
    };

    const handleCorrectChange = (id, checked) => {
        const questionType = form.getFieldValue('questionType');

        // Nếu là single choice (1), chỉ cho phép 1 đáp án đúng
        if (questionType === 1) {
            setOptions(options.map(opt => ({
                ...opt,
                isCorrect: opt.id === id ? checked : false,
            })));
        } else {
            // Multiple choice
            setOptions(options.map(opt =>
                opt.id === id ? { ...opt, isCorrect: checked } : opt,
            ));
        }
        setIsChangedFormValues(true);
    };

    const handleSubmit = (values) => {
        // Validate có ít nhất 1 đáp án đúng
        const hasCorrect = options.some(opt => opt.isCorrect);
        if (!hasCorrect) {
            form.setFields([{
                name: 'options',
                errors: [translate.formatMessage(commonMessage.requireCorrectAnswer)],
            }]);
            return;
        }

        // Validate tất cả options phải có content
        const emptyOption = options.find(opt => !opt.content.trim());
        if (emptyOption) {
            form.setFields([{
                name: 'options',
                errors: [translate.formatMessage(commonMessage.requireAllOptions)],
            }]);
            return;
        }

        return mixinFuncs.handleSubmit({
            ...values,
            taskId: taskId,
            options: JSON.stringify(options.map(({ id, ...rest }) => rest)),
        });
    };

    useEffect(() => {
        if (dataDetail) {
            form.setFieldsValue({
                question: dataDetail?.question,
                questionType: dataDetail?.questionType,
            });

            // Parse options từ JSON string
            if (dataDetail?.options) {
                try {
                    const parsedOptions = JSON.parse(dataDetail.options);
                    if (Array.isArray(parsedOptions)) {
                        setOptions(parsedOptions.map((opt, idx) => ({
                            id: idx + 1,
                            content: opt.content || opt.text || '',
                            isCorrect: opt.isCorrect || false,
                        })));
                    }
                } catch (e) {
                    console.error('Failed to parse options:', e);
                }
            }
        }
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={16}>
                    <Col span={24}>
                        <TextField
                            label={translate.formatMessage(commonMessage.question)}
                            required
                            name="question"
                            requiredMsg={translate.formatMessage(commonMessage.required)}
                            type="textarea"
                            rows={3}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <SelectField
                            label={translate.formatMessage(commonMessage.questionType)}
                            required
                            name="questionType"
                            requiredMsg={translate.formatMessage(commonMessage.required)}
                            options={questionTypeValues}
                            allowClear={false}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label={translate.formatMessage(commonMessage.options)}
                            name="options"
                            rules={[{ required: true, message: '' }]}
                        >
                            <div>
                                {options.map((option, index) => (
                                    <Space key={option.id} style={{ display: 'flex', marginBottom: 8 }} align="center">
                                        <Checkbox
                                            checked={option.isCorrect}
                                            onChange={(e) => handleCorrectChange(option.id, e.target.checked)}
                                        />
                                        <Input
                                            placeholder={`${translate.formatMessage(commonMessage.option)} ${index + 1}`}
                                            value={option.content}
                                            onChange={(e) => updateOption(option.id, 'content', e.target.value)}
                                            style={{ width: 400 }}
                                        />
                                        {options.length > 2 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeOption(option.id)}
                                            />
                                        )}
                                    </Space>
                                ))}
                                <Button
                                    type="dashed"
                                    onClick={addOption}
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 8 }}
                                >
                                    {translate.formatMessage(commonMessage.addOption)}
                                </Button>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default TaskQuestionForm;
