import { defineComponent, ref } from 'vue'
import {
  ElAlert,
  ElButton,
  ElDialog,
  ElDrawer,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElPopconfirm,
  ElPopover,
  ElResult,
  ElTooltip,
  ElTour,
  ElTourStep,
} from 'element-plus'

import PageContainer from '@/components/PageContainer'
import DemoBlock from '@/components/DemoBlock'
import * as u from '@/styles/utility.css'
import s from './feedback.module.scss'

export default defineComponent({
  name: 'ComponentsFeedbackPage',
  setup() {
    const dialogVisible = ref(false)
    const drawerVisible = ref(false)
    const tourOpen = ref(false)
    const loadingBox = ref<HTMLElement>()

    function confirmDelete() {
      ElMessage.success('已确认删除')
    }

    function showFullLoading() {
      const instance = ElLoading.service({
        lock: true,
        text: '加载中…',
        background: 'rgba(0, 0, 0, 0.35)',
      })
      window.setTimeout(() => instance.close(), 1200)
    }

    function showBoxLoading() {
      if (!loadingBox.value) return
      const instance = ElLoading.service({ target: loadingBox.value, text: '加载中…' })
      window.setTimeout(() => instance.close(), 1200)
    }

    return () => (
      <PageContainer
        title="反馈组件"
        subtitle="提示、弹窗、抽屉、消息等反馈类组件。命令式 API（Message / MessageBox / Notification / Loading）在 TSX 里直接当函数调用即可。"
      >
        {{
          default: () => (
            <div class={u.stackCol}>
              <DemoBlock
                title="ElAlert"
                desc="警告提示；type 决定语义色，description 属性或默认插槽放详细说明。"
                block
              >
                <div class={s.alertStack}>
                  <ElAlert title="默认提示" type="info" showIcon />
                  <ElAlert title="成功提示" type="success" showIcon />
                  <ElAlert title="警告提示" type="warning" showIcon />
                  <ElAlert title="错误提示" type="error" showIcon />
                  <ElAlert
                    title="带描述的提示"
                    type="info"
                    description="description 属性适合纯文本说明。"
                    showIcon
                  />
                  <ElAlert type="success" showIcon>
                    {{
                      title: () => <span class={u.fontMedium}>title 具名插槽</span>,
                      default: () => (
                        <div class={u.textSm}>默认插槽作为描述内容，可放任意节点。</div>
                      ),
                    }}
                  </ElAlert>
                  <ElAlert title="可关闭" type="info" closable showIcon />
                </div>
              </DemoBlock>

              <DemoBlock
                title="ElMessage · 命令式"
                desc="从 element-plus 直接调用，不需要挂载组件；返回实例可手动 close。"
              >
                <ElButton onClick={() => ElMessage('这是一条普通消息')}>基础用法</ElButton>
                <ElButton type="success" onClick={() => ElMessage.success('操作成功')}>
                  success
                </ElButton>
                <ElButton type="warning" onClick={() => ElMessage.warning('请检查输入')}>
                  warning
                </ElButton>
                <ElButton type="danger" onClick={() => ElMessage.error('请求失败')}>
                  error
                </ElButton>
                <ElButton
                  onClick={() =>
                    ElMessage({
                      message: '带配置的消息：3 秒关闭、可重复点击',
                      type: 'info',
                      duration: 3000,
                      showClose: true,
                    })
                  }
                >
                  带配置
                </ElButton>
              </DemoBlock>

              <DemoBlock
                title="ElMessageBox · 命令式"
                desc="confirm / alert / prompt 都返回 Promise：确认走 resolve，取消走 reject。"
              >
                <ElButton
                  onClick={() =>
                    void ElMessageBox.confirm('确定要执行这个操作吗？', '提示', {
                      type: 'warning',
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                    })
                      .then(() => ElMessage.success('已确认'))
                      .catch(() => ElMessage.info('已取消'))
                  }
                >
                  confirm
                </ElButton>
                <ElButton
                  onClick={() =>
                    void ElMessageBox.alert('只有确定按钮的告知型弹窗', '提示').then(() =>
                      ElMessage.info('已关闭'),
                    )
                  }
                >
                  alert
                </ElButton>
                <ElButton
                  onClick={() =>
                    void ElMessageBox.prompt('请输入变更原因', '提示', {
                      inputPlaceholder: '原因',
                    })
                      .then((res: unknown) => {
                        const value = (res as { value?: string }).value ?? ''
                        ElMessage.success(`输入：${value}`)
                      })
                      .catch(() => ElMessage.info('已取消'))
                  }
                >
                  prompt
                </ElButton>
              </DemoBlock>

              <DemoBlock
                title="ElNotification · 命令式"
                desc="右上角通知卡片，适合系统级提醒；比 Message 支持更多内容结构。"
              >
                <ElButton
                  onClick={() =>
                    ElNotification({ title: '通知标题', message: '这是一条基础通知' })
                  }
                >
                  基础用法
                </ElButton>
                <ElButton
                  type="success"
                  onClick={() =>
                    ElNotification({
                      title: '保存成功',
                      message: '数据已同步到服务器',
                      type: 'success',
                      duration: 3000,
                    })
                  }
                >
                  success
                </ElButton>
                <ElButton
                  type="warning"
                  onClick={() =>
                    ElNotification({
                      title: '磁盘告警',
                      message: '剩余空间不足 10%',
                      type: 'warning',
                      position: 'bottom-right',
                    })
                  }
                >
                  指定位置
                </ElButton>
              </DemoBlock>

              <DemoBlock
                title="ElLoading · 命令式"
                desc="ElLoading.service(options) 返回实例，close() 关闭；target 指定容器即局部加载。"
                block
              >
                <div class={`${u.flex} ${u.flexWrap} ${u.itemsCenter} ${u.gap3}`}>
                  <ElButton type="primary" onClick={showFullLoading}>
                    全屏 Loading
                  </ElButton>
                  <ElButton onClick={showBoxLoading}>局部 Loading</ElButton>
                </div>
                <div ref={loadingBox} class={s.loadingBoxStyle}>
                  target 指向这个容器
                </div>
                <p class={s.noteText}>
                  注意：main.tsx 只注册了 pinia 与 router，没有 app.use(ElementPlus)，
                  所以模板里的 v-loading 指令不可用，只能用 ElLoading.service。
                  要启用指令需自行注册：
                  <code class={s.noteCode}>app.use(ElLoading)</code> 或
                  <code class={s.noteCode}>app.directive('loading', ElLoading.directive)</code>。
                </p>
              </DemoBlock>

              <DemoBlock
                title="ElDialog"
                desc="对话框；modelValue 控制显隐，footer 是具名插槽，需自行放按钮。"
              >
                <ElButton type="primary" onClick={() => (dialogVisible.value = true)}>
                  打开对话框
                </ElButton>
                <ElDialog
                  modelValue={dialogVisible.value}
                  onUpdate:modelValue={(value?: boolean) => (dialogVisible.value = Boolean(value))}
                  title="对话框标题"
                  width="440px"
                >
                  {{
                    default: () => (
                      <div class={s.textSmSecondary}>
                        正文走默认插槽。modelValue 控制显隐，关闭时通过 onUpdate:modelValue 回写。
                      </div>
                    ),
                    footer: () => (
                      <div class={s.dialogFooter}>
                        <ElButton onClick={() => (dialogVisible.value = false)}>取消</ElButton>
                        <ElButton type="primary" onClick={() => (dialogVisible.value = false)}>
                          确定
                        </ElButton>
                      </div>
                    ),
                  }}
                </ElDialog>
              </DemoBlock>

              <DemoBlock title="ElDrawer" desc="抽屉；direction 控制方向，size 控制尺寸。">
                <ElButton type="primary" onClick={() => (drawerVisible.value = true)}>
                  打开抽屉
                </ElButton>
                <ElDrawer
                  modelValue={drawerVisible.value}
                  onUpdate:modelValue={(value?: boolean) => (drawerVisible.value = Boolean(value))}
                  title="抽屉标题"
                  direction="rtl"
                  size="320px"
                >
                  {{
                    default: () => (
                      <div class={s.textSmSecondary}>
                        抽屉内容。direction 可选 ltr / rtl / ttb / btt。
                      </div>
                    ),
                    footer: () => (
                      <div class={s.dialogFooter}>
                        <ElButton onClick={() => (drawerVisible.value = false)}>关闭</ElButton>
                        <ElButton type="primary" onClick={() => (drawerVisible.value = false)}>
                          保存
                        </ElButton>
                      </div>
                    ),
                  }}
                </ElDrawer>
              </DemoBlock>

              <DemoBlock
                title="ElPopconfirm"
                desc="气泡确认框；触发元素放 reference 插槽，确认/取消走 onConfirm / onCancel。"
              >
                <ElPopconfirm
                  title="确定要删除这条记录吗？"
                  confirmButtonText="删除"
                  cancelButtonText="取消"
                  onConfirm={confirmDelete}
                  onCancel={() => ElMessage.info('已取消')}
                >
                  {{
                    reference: () => (
                      <ElButton type="danger" plain>
                        删除
                      </ElButton>
                    ),
                  }}
                </ElPopconfirm>
              </DemoBlock>

              <DemoBlock
                title="ElPopover"
                desc="信息浮层；reference 插槽是触发元素，默认插槽是浮层内容。"
              >
                <ElPopover placement="top" width={260} trigger="click">
                  {{
                    reference: () => <ElButton>点击弹出</ElButton>,
                    default: () => (
                      <div class={s.popoverText}>
                        默认插槽作为浮层内容，可以放<b>富文本</b>或任意组件。
                      </div>
                    ),
                  }}
                </ElPopover>
                <ElPopover title="带标题" content="content 属性适合纯文本" trigger="hover">
                  {{
                    reference: () => <ElButton>悬停弹出</ElButton>,
                  }}
                </ElPopover>
              </DemoBlock>

              <DemoBlock
                title="ElTooltip"
                desc="文字提示；content 传纯文本，需要结构时改用 content 具名插槽。"
              >
                <ElTooltip content="这是一段提示" placement="top">
                  <ElButton>悬停查看</ElButton>
                </ElTooltip>
                <ElTooltip placement="bottom" effect="light">
                  {{
                    default: () => <ElButton>自定义内容</ElButton>,
                    content: () => (
                      <span>
                        插槽内容支持<strong>富文本</strong>
                      </span>
                    ),
                  }}
                </ElTooltip>
              </DemoBlock>

              <DemoBlock
                title="ElTour / ElTourStep"
                desc="分步引导；modelValue 控制显隐，每个 ElTourStep 用 target 指定锚点选择器。"
                block
              >
                <div class={s.tourAnchors}>
                  <ElButton type="primary" onClick={() => (tourOpen.value = true)}>
                    开始引导
                  </ElButton>
                  <div id="tour-anchor-1" class={s.tourAnchor}>
                    锚点 1
                  </div>
                  <div id="tour-anchor-2" class={s.tourAnchor}>
                    锚点 2
                  </div>
                </div>
                <ElTour
                  modelValue={tourOpen.value}
                  onUpdate:modelValue={(value?: boolean) => (tourOpen.value = Boolean(value))}
                  onClose={() => (tourOpen.value = false)}
                  onFinish={() => (tourOpen.value = false)}
                >
                  <ElTourStep
                    target="#tour-anchor-1"
                    title="第一步"
                    description="先看这个锚点，点击下一步继续。"
                  />
                  <ElTourStep
                    target="#tour-anchor-2"
                    title="第二步"
                    description="引导结束。"
                  />
                </ElTour>
              </DemoBlock>

              <DemoBlock
                title="ElResult"
                desc="结果页；icon 可选 success / warning / info / error，extra 插槽放操作区。"
                block
              >
                <div class={s.resultRow}>
                  <ElResult icon="success" title="操作成功" subTitle="数据已提交">
                    {{
                      extra: () => <ElButton type="primary">返回列表</ElButton>,
                    }}
                  </ElResult>
                  <ElResult icon="warning" title="有风险操作" subTitle="请确认后再继续">
                    {{
                      extra: () => <ElButton>查看详情</ElButton>,
                    }}
                  </ElResult>
                  <ElResult icon="error" title="提交失败" subTitle="网络异常，请稍后重试">
                    {{
                      extra: () => <ElButton type="primary">重新提交</ElButton>,
                    }}
                  </ElResult>
                </div>
              </DemoBlock>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})
