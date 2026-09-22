import { computed, defineComponent, reactive, ref } from 'vue'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer'
import * as u from '@/styles/utility.css'
import * as s from './table.css'

type Status = 'active' | 'pending' | 'disabled'

interface Row {
  id: string
  name: string
  email: string
  role: string
  status: Status
  amount: number
  createdAt: string
}

const STATUS: Record<Status, { label: string; type: 'success' | 'warning' | 'danger' }> = {
  active: { label: '已启用', type: 'success' },
  pending: { label: '待审核', type: 'warning' },
  disabled: { label: '已停用', type: 'danger' },
}

const ROLES = ['管理员', '运营', '财务', '访客']
const NAMES = [
  '林晚', '周予安', '许知遥', '陈墨', '沈观澜', '苏辞',
  '叶回舟', '白露', '江雪', '陆离', '温言', '程放',
]

function createRows(): Row[] {
  const statuses: Status[] = ['active', 'pending', 'disabled']
  return Array.from({ length: 46 }, (_, index) => ({
    id: `U${String(index + 1).padStart(4, '0')}`,
    name: `${NAMES[index % NAMES.length]}${index >= NAMES.length ? `·${Math.floor(index / NAMES.length) + 1}` : ''}`,
    email: `user${index + 1}@example.com`,
    role: ROLES[index % ROLES.length],
    status: statuses[index % statuses.length],
    amount: 1200 + ((index * 137) % 9800),
    createdAt: `2026-${String((index % 9) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')} ${String(9 + (index % 9)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`,
  }))
}

export default defineComponent({
  name: 'TableListPage',
  setup() {
    const rows = ref<Row[]>(createRows())

    const query = reactive({
      keyword: '',
      role: '',
      status: '' as '' | Status,
    })

    const page = ref(1)
    const pageSize = ref(10)

    const filtered = computed(() => {
      const keyword = query.keyword.trim().toLowerCase()
      return rows.value.filter((row) => {
        if (keyword && !row.name.toLowerCase().includes(keyword) && !row.email.includes(keyword)) {
          return false
        }
        if (query.role && row.role !== query.role) return false
        if (query.status && row.status !== query.status) return false
        return true
      })
    })

    const paged = computed(() => {
      const start = (page.value - 1) * pageSize.value
      return filtered.value.slice(start, start + pageSize.value)
    })

    function handleSearch() {
      page.value = 1
      ElMessage.success(`共匹配到 ${filtered.value.length} 条记录`)
    }

    function handleReset() {
      query.keyword = ''
      query.role = ''
      query.status = ''
      page.value = 1
    }

    function handleCreate() {
      ElMessage.info('这里可以打开新建抽屉或弹窗（示例）')
    }

    function handleEdit(row: Row) {
      ElMessage.info(`编辑 ${row.name}`)
    }

    async function handleDelete(row: Row) {
      try {
        await ElMessageBox.confirm(`确定要删除用户「${row.name}」吗？`, '删除确认', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        })
        rows.value = rows.value.filter((item) => item.id !== row.id)
        ElMessage.success(`已删除 ${row.name}`)
      } catch {
        /* 用户取消 */
      }
    }

    return () => (
      <PageContainer title="查询表格" subtitle="典型的中后台列表页：筛选 → 展示 → 行内操作。">
        {{
          extra: () => (
            <>
              <ElButton onClick={handleReset}>
                <ElIcon class={s.iconMr}>
                  <Refresh />
                </ElIcon>
                重置
              </ElButton>
              <ElButton type="primary" onClick={handleCreate}>
                <ElIcon class={s.iconMr}>
                  <Plus />
                </ElIcon>
                新建
              </ElButton>
            </>
          ),
          default: () => (
            <div class={u.stackCol}>
              {/* 筛选区 */}
              <div class={`${u.appCard} ${u.p5}`}>
                <ElForm inline labelWidth="64px" class={s.formNoGapY}>
                  <ElFormItem label="关键字">
                    {/* 包一层原生 div，以便挂载键盘事件 */}
                    <div
                      class={s.inputWrap}
                      onKeydown={(event) => {
                        if (event.key === 'Enter') handleSearch()
                      }}
                    >
                      <ElInput
                        modelValue={query.keyword}
                        onUpdate:modelValue={(value: string) => (query.keyword = value)}
                        placeholder="姓名 / 邮箱，回车搜索"
                        clearable
                      />
                    </div>
                  </ElFormItem>

                  <ElFormItem label="角色">
                    <ElSelect
                      modelValue={query.role}
                      onUpdate:modelValue={(value: string) => (query.role = value)}
                      placeholder="全部角色"
                      clearable
                      class={u.importantW40}
                    >
                      {ROLES.map((role) => (
                        <ElOption key={role} label={role} value={role} />
                      ))}
                    </ElSelect>
                  </ElFormItem>

                  <ElFormItem label="状态">
                    <ElSelect
                      modelValue={query.status}
                      onUpdate:modelValue={(value: Status | '') => (query.status = value)}
                      placeholder="全部状态"
                      clearable
                      class={u.importantW40}
                    >
                      {(Object.keys(STATUS) as Status[]).map((key) => (
                        <ElOption key={key} label={STATUS[key].label} value={key} />
                      ))}
                    </ElSelect>
                  </ElFormItem>

                  <ElFormItem>
                    <ElButton type="primary" onClick={handleSearch}>
                      <ElIcon class={s.iconMr}>
                        <Search />
                      </ElIcon>
                      查询
                    </ElButton>
                  </ElFormItem>
                </ElForm>
              </div>

              {/* 表格区 */}
              <div class={`${u.appCard} ${u.overflowHidden}`}>
                <ElTable data={paged.value} rowKey="id" class={u.importantWFull}>
                  <ElTableColumn prop="id" label="编号" width="100" />
                  <ElTableColumn prop="name" label="姓名" minWidth="120" />
                  <ElTableColumn prop="email" label="邮箱" minWidth="200" />
                  <ElTableColumn prop="role" label="角色" width="110" />

                  <ElTableColumn label="状态" width="110">
                    {{
                      default: ({ row }: { row: unknown }) => {
                        const item = row as Row
                        return (
                          <ElTag type={STATUS[item.status].type} effect="light">
                            {STATUS[item.status].label}
                          </ElTag>
                        )
                      },
                    }}
                  </ElTableColumn>

                  <ElTableColumn label="额度" width="130" align="right">
                    {{
                      default: ({ row }: { row: unknown }) => (
                        <span class={s.amountCell}>
                          ¥ {(row as Row).amount.toLocaleString('zh-CN')}
                        </span>
                      ),
                    }}
                  </ElTableColumn>

                  <ElTableColumn prop="createdAt" label="创建时间" width="180" />

                  <ElTableColumn label="操作" width="140" fixed="right">
                    {{
                      default: ({ row }: { row: unknown }) => {
                        const item = row as Row
                        return (
                          <div class={s.actionGroup}>
                            <ElButton
                              link
                              type="primary"
                              size="small"
                              onClick={() => handleEdit(item)}
                            >
                              <ElIcon class={s.iconMr}>
                                <Edit />
                              </ElIcon>
                              编辑
                            </ElButton>
                            <ElButton
                              link
                              type="danger"
                              size="small"
                              onClick={() => handleDelete(item)}
                            >
                              <ElIcon class={s.iconMr}>
                                <Delete />
                              </ElIcon>
                              删除
                            </ElButton>
                          </div>
                        )
                      },
                    }}
                  </ElTableColumn>
                </ElTable>

                <div class={s.paginationBar}>
                  <ElPagination
                    currentPage={page.value}
                    pageSize={pageSize.value}
                    total={filtered.value.length}
                    pageSizes={[10, 20, 50]}
                    layout="total, sizes, prev, pager, next, jumper"
                    background
                    onUpdate:current-page={(value: number) => (page.value = value)}
                    onUpdate:page-size={(value: number) => {
                      pageSize.value = value
                      page.value = 1
                    }}
                  />
                </div>
              </div>
            </div>
          ),
        }}
      </PageContainer>
    )
  },
})
