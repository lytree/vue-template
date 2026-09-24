import { defineComponent, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElSwitch,
} from 'element-plus'
import PageContainer from '@/components/PageContainer'
import * as u from '@/styles/utility.css'
import s from './basic.module.scss'

interface FormModel {
  name: string
  code: string
  owner: string
  type: string
  level: number
  enabled: boolean
  description: string
}

export default defineComponent({
  name: 'BasicFormPage',
  setup() {
    const formRef = ref<FormInstance>()

    const form = reactive<FormModel>({
      name: '',
      code: '',
      owner: '',
      type: 'internal',
      level: 1,
      enabled: true,
      description: '',
    })

    const rules: FormRules<FormModel> = {
      name: [
        { required: true, message: '请输入项目名称', trigger: 'blur' },
        { min: 2, max: 24, message: '长度需在 2 到 24 个字符之间', trigger: 'blur' },
      ],
      code: [
        { required: true, message: '请输入项目标识', trigger: 'blur' },
        {
          pattern: /^[a-z][a-z0-9-]*$/,
          message: '只能以小写字母开头，包含小写字母、数字或短横线',
          trigger: 'blur',
        },
      ],
      owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
      description: [{ max: 200, message: '最多 200 个字符', trigger: 'blur' }],
    }

    async function handleSubmit() {
      if (!formRef.value) return
      try {
        await formRef.value.validate()
        ElMessage.success('校验通过，已提交（示例）')
      } catch {
        ElMessage.error('请先修正表单中的错误')
      }
    }

    function handleReset() {
      formRef.value?.resetFields()
    }

    return () => (
      <PageContainer title="表单页" subtitle="基础表单与校验规则，演示 Element Plus 与 antd 风格的融合。">
        {{
          default: () => (
            <div class={`${u.appCard} ${u.maxW3xl} ${u.p6}`}>
              <ElForm
                ref={formRef}
                model={form}
                rules={rules}
                labelWidth="96px"
                labelPosition="right"
              >
                <ElFormItem label="项目名称" prop="name">
                  <ElInput
                    modelValue={form.name}
                    onUpdate:modelValue={(value: string) => (form.name = value)}
                    placeholder="例如：订单中心"
                    clearable
                  />
                </ElFormItem>

                <ElFormItem label="项目标识" prop="code">
                  <ElInput
                    modelValue={form.code}
                    onUpdate:modelValue={(value: string) => (form.code = value)}
                    placeholder="例如：order-center"
                    clearable
                  />
                </ElFormItem>

                <ElFormItem label="负责人" prop="owner">
                  <ElSelect
                    modelValue={form.owner}
                    onUpdate:modelValue={(value: string) => (form.owner = value)}
                    placeholder="请选择负责人"
                    clearable
                    class={s.selectFull}
                  >
                    {['林晚', '周予安', '许知遥', '陈墨'].map((name) => (
                      <ElOption key={name} label={name} value={name} />
                    ))}
                  </ElSelect>
                </ElFormItem>

                <ElFormItem label="项目类型">
                  <ElRadioGroup
                    modelValue={form.type}
                    onUpdate:modelValue={(value: string | number | boolean | undefined) =>
                      (form.type = String(value))
                    }
                  >
                    <ElRadioButton value="internal">内部项目</ElRadioButton>
                    <ElRadioButton value="external">对外项目</ElRadioButton>
                    <ElRadioButton value="mixed">混合</ElRadioButton>
                  </ElRadioGroup>
                </ElFormItem>

                <ElFormItem label="优先级">
                  <ElInputNumber
                    modelValue={form.level}
                    onUpdate:modelValue={(value: number | undefined) => (form.level = value ?? 1)}
                    min={1}
                    max={5}
                    controlsPosition="right"
                  />
                  <span class={s.priorityHint}>1 最低，5 最高</span>
                </ElFormItem>

                <ElFormItem label="立即启用">
                  <ElSwitch
                    modelValue={form.enabled}
                    onUpdate:modelValue={(value: string | number | boolean) =>
                      (form.enabled = Boolean(value))
                    }
                  />
                </ElFormItem>

                <ElFormItem label="项目描述" prop="description">
                  <ElInput
                    modelValue={form.description}
                    onUpdate:modelValue={(value: string) => (form.description = value)}
                    type="textarea"
                    rows={4}
                    maxlength={200}
                    showWordLimit
                    placeholder="简要描述这个项目的目标与范围"
                  />
                </ElFormItem>

                <ElFormItem label=" ">
                  <div class={s.buttonRow}>
                    <ElButton type="primary" onClick={handleSubmit}>
                      提交
                    </ElButton>
                    <ElButton onClick={handleReset}>重置</ElButton>
                  </div>
                </ElFormItem>
              </ElForm>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})
