import { defineComponent, reactive, ref } from 'vue'
import {
  ElAutocomplete,
  ElButton,
  ElCascader,
  ElCascaderPanel,
  ElCheckTag,
  ElCheckbox,
  ElCheckboxButton,
  ElCheckboxGroup,
  ElColorPicker,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElInputOtp,
  ElInputTag,
  ElMention,
  ElMessage,
  ElOption,
  ElOptionGroup,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElSegmented,
  ElSelect,
  ElSelectV2,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
  ElTransfer,
  ElTreeSelect,
  ElUpload,
} from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

import PageContainer from '@/components/PageContainer'
import DemoBlock from '@/components/DemoBlock'

const CASCADER_OPTIONS = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州' },
      { value: 'ningbo', label: '宁波' },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京' },
      { value: 'suzhou', label: '苏州' },
    ],
  },
]

const TREE_DATA = [
  {
    value: 'frontend',
    label: '前端',
    children: [
      { value: 'vue', label: 'Vue' },
      { value: 'react', label: 'React' },
    ],
  },
  {
    value: 'backend',
    label: '后端',
    children: [
      { value: 'node', label: 'Node.js' },
      { value: 'go', label: 'Go' },
    ],
  },
]

const TRANSFER_DATA = Array.from({ length: 8 }, (_, index) => ({
  key: index + 1,
  label: `选项 ${index + 1}`,
}))

const SELECT_V2_OPTIONS = Array.from({ length: 200 }, (_, index) => ({
  label: `选项 ${index + 1}`,
  value: `v${index + 1}`,
}))

const AUTOCOMPLETE_POOL = ['Vue', 'Vite', 'Vitest', 'Vue Router', 'VueUse', 'Volar']

/** 表单页：Element Plus 表单族在 TSX 里的调用约定 */
export default defineComponent({
  name: 'ComponentsFormPage',
  setup() {
    /* ---------------- 表单校验 ---------------- */
    const formRef = ref<FormInstance>()
    const form = reactive({ name: '', region: '', agree: false })
    const rules: FormRules = {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      region: [{ required: true, message: '请选择归属地区', trigger: 'change' }],
    }

    async function handleSubmit() {
      const valid = await formRef.value?.validate().catch(() => false)
      if (valid) ElMessage.success('校验通过，已提交')
    }

    /* ---------------- 受控值 ---------------- */
    const text = ref('')
    const textarea = ref('')
    const number = ref(3)
    const tags = ref<string[]>(['Vue', 'Vite'])
    const otp = ref('')
    const mention = ref('')
    const autocomplete = ref('')
    const select = ref('')
    const selectMulti = ref<string[]>([])
    const selectV2 = ref('')
    const cascader = ref<string[]>([])
    const cascaderPanel = ref<string[]>(['zhejiang', 'hangzhou'])
    const checks = ref<string[]>(['vue'])
    const radio = ref('vue')
    const toggle = ref(true)
    const slider = ref(40)
    const sliderRange = ref<number[]>([20, 70])
    const rate = ref(3)
    const date = ref('')
    const dateRange = ref<string[]>([])
    const time = ref('')
    const timeSelect = ref('')
    const color = ref('#1677ff')
    const transfer = ref<number[]>([1, 2])
    const treeValue = ref('')
    const segmented = ref('日')
    const checkTag = ref(false)

    /**
     * Element Plus 的 modelValue 常是复杂联合类型，回调参数统一标 `unknown` 再显式收敛，
     * 既不会撞上逆变检查，也能强制你在赋值处做类型转换。
     */
    const setText = (value?: unknown) => (text.value = String(value ?? ''))
    const setNumber = (value?: unknown) => (number.value = Number(value ?? 0))

    /**
     * 只有 Autocomplete 的 fetchSuggestions 回调需要 any：
     * Element Plus 的 AutocompleteFetchSuggestions 类型对回调参数做逆变检查，
     * 标 unknown 会因 unknown 不可赋给 AutocompleteData 而失败。
     */
    function fetchSuggestions(query: string, cb: (data: any) => void) {
      const list = query
        ? AUTOCOMPLETE_POOL.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
        : AUTOCOMPLETE_POOL
      cb(list.map((item) => ({ value: item })))
    }

    return () => (
      <PageContainer
        title="表单组件"
        subtitle="Element Plus 表单族的 TSX 调用。核心约定：v-model 要拆成 modelValue + onUpdate:modelValue。"
      >
        {{
          default: () => (
            <div class="flex flex-col gap-4">
              <DemoBlock
                title="ElForm / ElFormItem · 校验"
                desc="用 ref 拿到表单实例调用 validate()；rules 支持 required / type / 自定义 validator。"
                block
              >
                <ElForm ref={formRef} model={form} rules={rules} labelWidth="88px" class="max-w-md">
                  <ElFormItem label="名称" prop="name">
                    <ElInput
                      modelValue={form.name}
                      onUpdate:modelValue={(value?: unknown) => (form.name = String(value ?? ''))}
                      placeholder="请输入名称"
                      clearable
                    />
                  </ElFormItem>
                  <ElFormItem label="归属地区" prop="region">
                    <ElSelect
                      modelValue={form.region}
                      onUpdate:modelValue={(value?: unknown) =>
                        (form.region = String(value ?? ''))
                      }
                      placeholder="请选择"
                      class="w-full"
                    >
                      {['浙江', '江苏', '广东'].map((item) => (
                        <ElOption key={item} label={item} value={item} />
                      ))}
                    </ElSelect>
                  </ElFormItem>
                  <ElFormItem label="同意协议" prop="agree">
                    <ElCheckbox
                      modelValue={form.agree}
                      onUpdate:modelValue={(value?: unknown) => (form.agree = Boolean(value))}
                    >
                      我已阅读并同意
                    </ElCheckbox>
                  </ElFormItem>
                  <ElFormItem>
                    <ElButton type="primary" onClick={handleSubmit}>
                      提交校验
                    </ElButton>
                  </ElFormItem>
                </ElForm>
              </DemoBlock>

              <DemoBlock
                title="ElInput"
                desc="文本 / 多行 / 密码 / 前后缀 / 尺寸；前后缀是具名插槽，用对象字面量传入。"
                block
              >
                <div class="flex flex-col gap-3">
                  <ElInput
                    modelValue={text.value}
                    onUpdate:modelValue={setText}
                    placeholder="基础输入框"
                    clearable
                    class="max-w-md"
                  />
                  <ElInput
                    modelValue={text.value}
                    onUpdate:modelValue={setText}
                    placeholder="带前后缀"
                    class="max-w-md"
                  >
                    {{
                      prefix: () => <span class="text-text-tertiary">@</span>,
                      suffix: () => <span class="text-text-tertiary">.com</span>,
                    }}
                  </ElInput>
                  <ElInput
                    modelValue={textarea.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (textarea.value = String(value ?? ''))
                    }
                    type="textarea"
                    rows={3}
                    placeholder="多行文本"
                    class="max-w-md"
                  />
                  <ElInput
                    modelValue={text.value}
                    onUpdate:modelValue={setText}
                    type="password"
                    placeholder="密码"
                    showPassword
                    class="max-w-md"
                  />
                  <ElInput
                    modelValue={text.value}
                    onUpdate:modelValue={setText}
                    size="small"
                    placeholder="小尺寸"
                    class="max-w-md"
                  />
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElInputNumber"
                desc="数字输入，min / max / step / precision 控制范围与精度。"
              >
                <ElInputNumber
                  modelValue={number.value}
                  onUpdate:modelValue={setNumber}
                  min={0}
                  max={10}
                />
                <ElInputNumber
                  modelValue={number.value}
                  onUpdate:modelValue={setNumber}
                  step={0.5}
                  precision={1}
                />
                <ElInputNumber
                  modelValue={number.value}
                  onUpdate:modelValue={setNumber}
                  disabled
                />
              </DemoBlock>

              <DemoBlock
                title="ElInputTag"
                desc="标签式输入，modelValue 是字符串数组，回车生成新标签。"
                block
              >
                <ElInputTag
                  modelValue={tags.value}
                  onUpdate:modelValue={(value?: unknown) => (tags.value = (value ?? []) as string[])}
                  class="max-w-md"
                />
              </DemoBlock>

              <DemoBlock
                title="ElInputOtp"
                desc="一次性验证码输入框，length 控制位数；type 是外观变体（outlined / filled / underlined）。"
              >
                <ElInputOtp
                  modelValue={otp.value}
                  onUpdate:modelValue={(value?: unknown) => (otp.value = String(value ?? ''))}
                  length={6}
                />
                <ElInputOtp
                  modelValue={otp.value}
                  onUpdate:modelValue={(value?: unknown) => (otp.value = String(value ?? ''))}
                  length={4}
                  type="filled"
                />
              </DemoBlock>

              <DemoBlock
                title="ElMention"
                desc="支持 @ 提及的输入框，options 提供候选项。"
                block
              >
                <ElMention
                  modelValue={mention.value}
                  onUpdate:modelValue={(value?: unknown) => (mention.value = String(value ?? ''))}
                  options={[
                    { value: 'vue', label: 'Vue' },
                    { value: 'vite', label: 'Vite' },
                    { value: 'pinia', label: 'Pinia' },
                  ]}
                  placeholder="输入 @ 触发提及"
                  class="max-w-md"
                />
              </DemoBlock>

              <DemoBlock
                title="ElAutocomplete"
                desc="带输入建议的输入框；fetchSuggestions 按关键字回填候选。"
                block
              >
                <ElAutocomplete
                  modelValue={autocomplete.value}
                  onUpdate:modelValue={(value?: unknown) =>
                    (autocomplete.value = String(value ?? ''))
                  }
                  fetchSuggestions={fetchSuggestions}
                  placeholder="输入 Vue / Vite 试试"
                  class="max-w-md"
                />
              </DemoBlock>

              <DemoBlock
                title="ElSelect / ElOption / ElOptionGroup"
                desc="选项作为子节点传入；分组用 ElOptionGroup；多选时 modelValue 是数组。"
                block
              >
                <div class="flex flex-wrap items-center gap-3">
                  <ElSelect
                    modelValue={select.value}
                    onUpdate:modelValue={(value?: unknown) => (select.value = String(value ?? ''))}
                    placeholder="单选"
                    class="!w-52"
                  >
                    <ElOption label="Vue" value="vue" />
                    <ElOption label="React" value="react" />
                    <ElOption label="Svelte" value="svelte" />
                    <ElOption label="Angular" value="angular" disabled />
                  </ElSelect>

                  <ElSelect
                    modelValue={select.value}
                    onUpdate:modelValue={(value?: unknown) => (select.value = String(value ?? ''))}
                    placeholder="带分组"
                    class="!w-52"
                  >
                    <ElOptionGroup label="前端框架">
                      <ElOption label="Vue" value="vue" />
                      <ElOption label="React" value="react" />
                    </ElOptionGroup>
                    <ElOptionGroup label="构建工具">
                      <ElOption label="Vite" value="vite" />
                      <ElOption label="Webpack" value="webpack" />
                    </ElOptionGroup>
                  </ElSelect>

                  <ElSelect
                    modelValue={selectMulti.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (selectMulti.value = (value ?? []) as string[])
                    }
                    multiple
                    clearable
                    collapseTags
                    placeholder="多选"
                    class="!w-64"
                  >
                    {['Vue', 'React', 'Svelte', 'Solid'].map((item) => (
                      <ElOption key={item} label={item} value={item} />
                    ))}
                  </ElSelect>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElSelectV2"
                desc="虚拟滚动下拉，适合海量选项；用 options 数组而非子节点。"
                block
              >
                <ElSelectV2
                  modelValue={selectV2.value}
                  onUpdate:modelValue={(value?: unknown) => (selectV2.value = String(value ?? ''))}
                  options={SELECT_V2_OPTIONS}
                  placeholder="200 条虚拟滚动选项"
                  class="!w-72"
                />
              </DemoBlock>

              <DemoBlock
                title="ElCascader"
                desc="级联选择，modelValue 是各级 value 组成的数组；props 可自定义字段名或开启多选。"
                block
              >
                <div class="flex flex-wrap items-center gap-3">
                  <ElCascader
                    modelValue={cascader.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (cascader.value = (value ?? []) as string[])
                    }
                    options={CASCADER_OPTIONS}
                    placeholder="请选择省市"
                    class="!w-72"
                  />
                  <ElCascader
                    modelValue={cascader.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (cascader.value = (value ?? []) as string[])
                    }
                    options={CASCADER_OPTIONS}
                    props={{ multiple: true }}
                    placeholder="多选级联"
                    class="!w-72"
                  />
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElCascaderPanel"
                desc="级联面板本体，不带弹出层，适合内嵌到自定义容器里。"
                block
              >
                <ElCascaderPanel
                  modelValue={cascaderPanel.value}
                  onUpdate:modelValue={(value?: unknown) =>
                    (cascaderPanel.value = (value ?? []) as string[])
                  }
                  options={CASCADER_OPTIONS}
                />
              </DemoBlock>

              <DemoBlock
                title="ElCheckbox / ElCheckboxButton / ElCheckboxGroup"
                desc="单个复选用 modelValue:boolean；成组交给 ElCheckboxGroup，modelValue 是数组。"
                block
              >
                <div class="flex flex-col gap-3">
                  <div class="flex items-center gap-4">
                    <ElCheckbox
                      modelValue={checkTag.value}
                      onUpdate:modelValue={(value?: unknown) => (checkTag.value = Boolean(value))}
                    >
                      单个复选
                    </ElCheckbox>
                    <ElCheckbox indeterminate>半选态</ElCheckbox>
                  </div>
                  <ElCheckboxGroup
                    modelValue={checks.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (checks.value = ((value ?? []) as unknown[]).map(String))
                    }
                  >
                    <ElCheckbox value="vue" label="Vue" />
                    <ElCheckbox value="react" label="React" />
                    <ElCheckbox value="svelte" label="Svelte" />
                  </ElCheckboxGroup>
                  <ElCheckboxGroup
                    modelValue={checks.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (checks.value = ((value ?? []) as unknown[]).map(String))
                    }
                  >
                    <ElCheckboxButton value="vue" label="Vue" />
                    <ElCheckboxButton value="react" label="React" />
                    <ElCheckboxButton value="svelte" label="Svelte" />
                  </ElCheckboxGroup>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElRadio / ElRadioButton / ElRadioGroup"
                desc="单选用 ElRadioGroup 包一层，值写在 ElRadio 的 value 上。"
                block
              >
                <div class="flex flex-col gap-3">
                  <ElRadioGroup
                    modelValue={radio.value}
                    onUpdate:modelValue={(value?: unknown) => (radio.value = String(value ?? ''))}
                  >
                    <ElRadio value="vue">Vue</ElRadio>
                    <ElRadio value="react">React</ElRadio>
                    <ElRadio value="svelte">Svelte</ElRadio>
                  </ElRadioGroup>
                  <ElRadioGroup
                    modelValue={radio.value}
                    onUpdate:modelValue={(value?: unknown) => (radio.value = String(value ?? ''))}
                  >
                    <ElRadioButton value="vue">Vue</ElRadioButton>
                    <ElRadioButton value="react">React</ElRadioButton>
                    <ElRadioButton value="svelte">Svelte</ElRadioButton>
                  </ElRadioGroup>
                </div>
              </DemoBlock>

              <DemoBlock title="ElSwitch" desc="开关；activeValue / inactiveValue 可自定义取值。">
                <ElSwitch
                  modelValue={toggle.value}
                  onUpdate:modelValue={(value?: unknown) => (toggle.value = Boolean(value))}
                />
                <ElSwitch
                  modelValue={radio.value}
                  onUpdate:modelValue={(value?: unknown) => (radio.value = String(value ?? ''))}
                  activeValue="vue"
                  inactiveValue="react"
                  activeText="Vue"
                  inactiveText="React"
                />
                <ElSwitch
                  modelValue={toggle.value}
                  onUpdate:modelValue={(value?: unknown) => (toggle.value = Boolean(value))}
                  disabled
                />
              </DemoBlock>

              <DemoBlock title="ElSlider" desc="滑块；传数组即为范围模式，showInput 附带输入框。">
                <div class="flex w-full max-w-md flex-col gap-4">
                  <ElSlider
                    modelValue={slider.value}
                    onUpdate:modelValue={(value?: unknown) => (slider.value = Number(value ?? 0))}
                  />
                  <ElSlider
                    modelValue={sliderRange.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (sliderRange.value = (value ?? []) as number[])
                    }
                    range
                    showInput
                  />
                  <ElSlider
                    modelValue={slider.value}
                    onUpdate:modelValue={(value?: unknown) => (slider.value = Number(value ?? 0))}
                    disabled
                  />
                </div>
              </DemoBlock>

              <DemoBlock title="ElRate" desc="评分；allowHalf 支持半星，showScore 显示分数。">
                <ElRate
                  modelValue={rate.value}
                  onUpdate:modelValue={(value?: unknown) => (rate.value = Number(value ?? 0))}
                />
                <ElRate
                  modelValue={rate.value}
                  onUpdate:modelValue={(value?: unknown) => (rate.value = Number(value ?? 0))}
                  allowHalf
                  showScore
                />
                <ElRate modelValue={rate.value} disabled />
              </DemoBlock>

              <DemoBlock title="ElColorPicker" desc="取色器，modelValue 为颜色字符串。">
                <ElColorPicker
                  modelValue={color.value}
                  onUpdate:modelValue={(value?: unknown) => (color.value = String(value ?? ''))}
                />
                <div class="flex items-center gap-2 text-sm text-text-secondary">
                  当前：
                  <span
                    class="inline-block size-4 rounded-antd-sm border border-border-secondary"
                    style={{ background: color.value }}
                  />
                  <code class="font-mono">{color.value}</code>
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElDatePicker"
                desc="日期选择；配 valueFormat 后 modelValue 直接是格式化字符串，TSX 里最省事。"
                block
              >
                <div class="flex flex-wrap items-center gap-3">
                  <ElDatePicker
                    modelValue={date.value}
                    onUpdate:modelValue={(value?: unknown) => (date.value = String(value ?? ''))}
                    type="date"
                    valueFormat="YYYY-MM-DD"
                    placeholder="选择日期"
                  />
                  <ElDatePicker
                    modelValue={dateRange.value}
                    onUpdate:modelValue={(value?: unknown) =>
                      (dateRange.value = (value ?? []) as string[])
                    }
                    type="daterange"
                    valueFormat="YYYY-MM-DD"
                    startPlaceholder="开始"
                    endPlaceholder="结束"
                  />
                  <ElDatePicker
                    modelValue={date.value}
                    onUpdate:modelValue={(value?: unknown) => (date.value = String(value ?? ''))}
                    type="month"
                    valueFormat="YYYY-MM"
                    placeholder="选择月份"
                  />
                </div>
              </DemoBlock>

              <DemoBlock title="ElTimePicker" desc="时间选择，支持单点与时间区间。">
                <ElTimePicker
                  modelValue={time.value}
                  onUpdate:modelValue={(value?: unknown) => (time.value = String(value ?? ''))}
                  valueFormat="HH:mm:ss"
                  placeholder="选择时间"
                />
                <ElTimePicker
                  modelValue={time.value}
                  onUpdate:modelValue={(value?: unknown) => (time.value = String(value ?? ''))}
                  isRange
                  rangeSeparator="至"
                  valueFormat="HH:mm:ss"
                />
              </DemoBlock>

              <DemoBlock
                title="ElTimeSelect"
                desc="从下拉列表里选时间，start / end / step 控制区间与步长。"
              >
                <ElTimeSelect
                  modelValue={timeSelect.value}
                  onUpdate:modelValue={(value?: unknown) =>
                    (timeSelect.value = String(value ?? ''))
                  }
                  start="08:30"
                  step="00:30"
                  end="18:30"
                  placeholder="选择时间"
                />
              </DemoBlock>

              <DemoBlock
                title="ElTransfer"
                desc="穿梭框；data 是数据源，modelValue 是右侧已选项的 key 数组。"
                block
              >
                <ElTransfer
                  modelValue={transfer.value}
                  onUpdate:modelValue={(value?: unknown) =>
                    (transfer.value = (value ?? []) as number[])
                  }
                  data={TRANSFER_DATA}
                />
              </DemoBlock>

              <DemoBlock
                title="ElTreeSelect"
                desc="树形下拉，data 传树结构；nodeKey 指定唯一字段，checkStrictly 允许选中父节点。"
                block
              >
                <ElTreeSelect
                  modelValue={treeValue.value}
                  // Element Plus 的 ElTreeSelect 运行时确实 emit 了 update:modelValue，
                  // 但类型声明漏了这个事件，直接写会报 "does not exist"。用展开语法绕过。
                  {...{
                    'onUpdate:modelValue': (value?: unknown) =>
                      (treeValue.value = String(value ?? '')),
                  }}
                  data={TREE_DATA}
                  nodeKey="value"
                  checkStrictly
                  placeholder="请选择"
                  class="!w-72"
                />
              </DemoBlock>

              <DemoBlock
                title="ElUpload"
                desc="上传；autoUpload={false} 时只收集文件不发请求，适合本地校验后再统一提交。"
                block
              >
                <ElUpload autoUpload={false} multiple limit={3} class="max-w-md">
                  {{
                    default: () => (
                      <div class="flex w-full cursor-pointer flex-col items-center gap-2 rounded-antd border border-dashed border-border px-6 py-8 text-sm text-text-secondary transition-colors hover:border-primary">
                        <ElIcon size={32} class="text-text-tertiary">
                          <UploadFilled />
                        </ElIcon>
                        点击或拖拽文件到此处
                      </div>
                    ),
                  }}
                </ElUpload>
              </DemoBlock>

              <DemoBlock title="ElSegmented" desc="分段控制器，options 支持字符串或 {label,value}。">
                <ElSegmented
                  modelValue={segmented.value}
                  onUpdate:modelValue={(value?: unknown) =>
                    (segmented.value = String(value ?? ''))
                  }
                  options={['日', '周', '月']}
                />
                <ElSegmented
                  modelValue={segmented.value}
                  onUpdate:modelValue={(value?: unknown) =>
                    (segmented.value = String(value ?? ''))
                  }
                  options={[
                    { label: '按天', value: '日' },
                    { label: '按周', value: '周' },
                    { label: '按月', value: '月' },
                  ]}
                />
              </DemoBlock>

              <DemoBlock
                title="ElCheckTag"
                desc="标签式复选。注意它的 props 是 checked / onUpdate:checked，不是 modelValue。"
              >
                <ElCheckTag
                  checked={checkTag.value}
                  onUpdate:checked={(value?: boolean) => (checkTag.value = Boolean(value))}
                >
                  可点击标签
                </ElCheckTag>
                <ElCheckTag checked type="primary">
                  选中态
                </ElCheckTag>
                <ElCheckTag checked disabled>
                  禁用
                </ElCheckTag>
              </DemoBlock>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})
