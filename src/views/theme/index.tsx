/**
 * 主题切换动画演示页 —— 对应 README §4.2 完整动画示例
 *
 * 该页面作为组件示例（components 分组）下的「主题动画」子页面：
 * /components/theme
 *
 * 演示要点：
 *   1. setTheme 的 8 种动画预设（fade / blur / scale / slide / expand / flash / shimmer / matrix）
 *   2. Material You 圆形扩散（带 originX/Y）
 *   3. Sun/Moon 切换按钮（themeIconRotate 旋转动画）
 *   4. beginThemeTransition（不切主题只触发过渡）
 *   5. 浏览器原生 view-transition（Chrome 111+）
 *   6. 立即切换（animate: false）
 *
 * 样式采用项目的兼容垫片 `u.xxx` —— 14 个业务文件都用这个形式，
 * 演示页保持一致性。
 */
import { computed, defineComponent } from 'vue'
import { ElButton, ElIcon, ElSpace, ElTag } from 'element-plus'
import { Moon, Sunny } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer'
import {
  useTheme,
  beginThemeTransition,
  setTheme as setThemeImpl,
  type ThemeAnimationName,
} from '@/styles/useTheme'
import * as u from '@/styles/utility.css'
import { cx } from '@/styles/compose'
import type { ThemeName } from '@/styles/useTheme'

/** 8 套预设动画的清单（用于渲染网格按钮） */
const ANIMATIONS: ReadonlyArray<{
  name: ThemeAnimationName
  label: string
  description: string
  className: string
}> = [
  { name: 'fade', label: 'Fade', description: 'body 轻量淡入（默认）', className: '' },
  { name: 'blur', label: 'Blur', description: '整页模糊 → 清晰', className: u.themeSwitchBlur },
  { name: 'scale', label: 'Scale', description: '整页轻微缩放 + overshoot', className: u.themeSwitchScale },
  { name: 'slide', label: 'Slide', description: '整页从下滑入', className: u.themeSwitchSlide },
  { name: 'expand', label: 'Expand', description: 'Material You 圆形扩散', className: u.themeSwitchExpand },
  { name: 'flash', label: 'Flash', description: '全屏半透明闪烁', className: u.themeFlash },
  { name: 'shimmer', label: 'Shimmer', description: '整页金色光带扫过', className: u.themeShimmer },
  { name: 'matrix', label: 'ColorMatrix', description: 'hue-rotate 色调偏移', className: u.themeColorMatrix },
]

export default defineComponent({
  name: 'ThemeAnimationDemo',
  setup() {
    const { theme, themeName, isDark, isTransitioning, setTheme, toggleTheme } = useTheme()

    /** 触发指定的整页动画（同时切换到 brand 主题） */
    async function triggerAnim(name: ThemeAnimationName) {
      await setTheme('brand', { animation: name })
    }

    /** Material You 圆形扩散 —— 用按钮点击位置 */
    async function triggerExpandFromButton(e: MouseEvent, next: ThemeName) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      await setTheme(next, {
        animation: 'expand',
        originX: rect.left + rect.width / 2,
        originY: rect.top + rect.height / 2,
      })
    }

    /** Sun/Moon 切换按钮（带图标旋转） */
    const showMoon = computed(() => isDark.value)

    return () => (
      <PageContainer
        title="主题切换动画演示"
        subtitle="setTheme 的 8 种动画预设 —— 与 README §4.2 一一对应"
      >
        {/* 当前状态条 */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <div class={cx(u.flex, u.itemsCenter, u.justifyBetween)}>
            <div class={cx(u.flex, u.itemsCenter, u.gap4)}>
              <span class={u.fontSemibold}>当前主题：</span>
              <ElTag type="primary" size="large">
                {themeName.value}
              </ElTag>
              <ElTag type={isDark.value ? 'info' : 'warning'} size="large">
                {isDark.value ? '暗色模式' : '亮色模式'}
              </ElTag>
              {isTransitioning.value && (
                <ElTag type="success" size="large">
                  切换中…
                </ElTag>
              )}
            </div>
            <div class={cx(u.flex, u.itemsCenter, u.gap3)}>
              <span class={cx(u.textSm, u.textTextTertiary)}>
                主题 className:{' '}
                <code class={u.fontMono}>
                  {theme.value.slice(0, 24)}…
                </code>
              </span>
            </div>
          </div>
        </section>

        {/* 1. 默认切换 */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            1. 默认切换（fadePulse 200ms）
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            toggleTheme —— body 加 themeFadePulse，主题感知属性走 350ms 过渡。
          </p>
          <ElSpace>
            <ElButton type="primary" disabled={isTransitioning.value} onClick={() => toggleTheme()}>
              切换（带默认 fadePulse 动画）
            </ElButton>
          </ElSpace>
        </section>

        {/* 2. Material You 圆形扩散（带点击位置） */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            2. Material You 圆形扩散（带点击位置）
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            animation: 'expand' + originX/Y —— 圆形从按钮中心扩散到 150% 覆盖整页（600ms）。
          </p>
          <ElSpace>
            <ElButton
              type="primary"
              plain
              disabled={isTransitioning.value}
              onClick={(e: MouseEvent) => triggerExpandFromButton(e, 'dark')}
            >
              点击我切到暗色（圆形展开）
            </ElButton>
            <ElButton
              type="warning"
              plain
              disabled={isTransitioning.value}
              onClick={(e: MouseEvent) => triggerExpandFromButton(e, 'light')}
            >
              点击我切到亮色（圆形展开）
            </ElButton>
          </ElSpace>
        </section>

        {/* 3. 模糊 / 缩放 / 滑动切换 */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            3. 模糊 / 缩放 / 滑动切换（无 originX）
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            切换到 brand / accent / light 主题时叠加不同的整页动画。
          </p>
          <ElSpace wrap>
            <ElButton
              type="success"
              disabled={isTransitioning.value}
              onClick={() => setTheme('brand', { animation: 'blur' })}
            >
              brand + blur
            </ElButton>
            <ElButton
              type="danger"
              disabled={isTransitioning.value}
              onClick={() => setTheme('accent', { animation: 'scale' })}
            >
              accent + scale
            </ElButton>
            <ElButton
              disabled={isTransitioning.value}
              onClick={() => setTheme('light', { animation: 'slide' })}
            >
              light + slide
            </ElButton>
          </ElSpace>
        </section>

        {/* 4. iOS 风 shimmer 高光（适合 brand/accent） */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            4. iOS 风 shimmer 高光（700ms）
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            整页一道白光扫过 —— 适合营销页面 / 品牌主题切换。
          </p>
          <ElSpace>
            <ElButton
              type="primary"
              disabled={isTransitioning.value}
              onClick={() => setTheme('brand', { animation: 'shimmer' })}
            >
              切到 brand（iOS shimmer）
            </ElButton>
            <ElButton
              type="warning"
              disabled={isTransitioning.value}
              onClick={() => setTheme('accent', { animation: 'shimmer' })}
            >
              切到 accent（iOS shimmer）
            </ElButton>
          </ElSpace>
        </section>

        {/* 5. Sun/Moon 切换按钮（图标转一圈） */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            5. Sun/Moon 切换按钮（图标旋转动画）
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            themeIconRotate 让图标在主题切换瞬间转一圈；themeIconAppear 用于双图标切换。
          </p>
          <ElSpace size="large" alignment="center">
            <button
              type="button"
              class={cx(
                u.flex,
                u.itemsCenter,
                u.justifyCenter,
                u.gap2,
                u.p3,
                u.rounded,
                u.borderPrimary,
                u.themeIconRotate,
              )}
              disabled={isTransitioning.value}
              onClick={() => toggleTheme()}
            >
              {showMoon.value ? (
                <>
                  <ElIcon size={18}>
                    <Moon />
                  </ElIcon>
                  <span>暗色模式</span>
                </>
              ) : (
                <>
                  <ElIcon size={18}>
                    <Sunny />
                  </ElIcon>
                  <span>亮色模式</span>
                </>
              )}
            </button>
            <span class={cx(u.textSm, u.textTextTertiary)}>
              点击切换时图标会 500ms 转一圈
            </span>
          </ElSpace>
        </section>

        {/* 6. 路由切换时触发主题过渡 */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            6. beginThemeTransition —— 不切主题，只触发过渡
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            适合路由切换 / 弹窗打开等场景：让所有主题感知属性统一走 200ms 平滑过渡。
          </p>
          <ElSpace>
            <ElButton
              disabled={isTransitioning.value}
              onClick={() => beginThemeTransition({ duration: 200 })}
            >
              触发 200ms 主题过渡
            </ElButton>
            <ElButton
              type="info"
              plain
              disabled={isTransitioning.value}
              onClick={() => beginThemeTransition({ duration: 500 })}
            >
              触发 500ms 主题过渡
            </ElButton>
          </ElSpace>
        </section>

        {/* 7. 浏览器原生 view-transition（Chrome 111+） */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            7. 浏览器原生 view-transition（Chrome 111+）
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            document.startViewTransition —— 浏览器原生整页快照淡入淡出。
            <br />
            <span class={u.textXs}>
              需要在 main.tsx 给 &lt;html&gt; 加 view-transition-name: root。
            </span>
          </p>
          <ElSpace>
            <ElButton
              type="primary"
              disabled={isTransitioning.value}
              onClick={() => {
                if (typeof (document as { startViewTransition?: unknown }).startViewTransition === 'function') {
                  ;(document as Document & { startViewTransition?: (cb: () => void) => unknown })
                    .startViewTransition?.(() => {
                      // 同步切主题（不让 startViewTransition 拍两次快照）
                      setThemeImpl('dark')
                    })
                } else {
                  // 浏览器不支持时回退到普通 setTheme
                  setThemeImpl('dark')
                }
              }}
            >
              浏览器原生 view-transition
            </ElButton>
          </ElSpace>
        </section>

        {/* 8. 立即切换（关闭动画） */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            8. 立即切换（关闭动画）
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            animate: false —— 不挂 themeTransitioning，颜色瞬间切换。用于 SSR / 测试 / 用户偏好立即切换。
          </p>
          <ElSpace>
            <ElButton
              type="danger"
              plain
              onClick={() => {
                setThemeImpl('dark')
              }}
            >
              立即切到 dark（不动画）
            </ElButton>
            <ElButton
              type="success"
              plain
              onClick={() => {
                setThemeImpl('light')
              }}
            >
              立即切到 light（不动画）
            </ElButton>
          </ElSpace>
        </section>

        {/* 9. 全网格：8 种动画预设一览 */}
        <section class={cx(u.appCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            9. 8 种动画预设一览 —— 切到 brand 主题试每一个
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            每个按钮触发对应整页动画 + 切到 brand 主题。
          </p>
          <div class={cx(u.grid, u.gridCols4, u.gap4)}>
            {ANIMATIONS.map((anim) => (
              <button
                key={anim.name}
                type="button"
                disabled={isTransitioning.value}
                onClick={() => triggerAnim(anim.name)}
                class={cx(
                  u.p4,
                  u.rounded,
                  u.borderPrimary,
                  u.cursorPointer,
                  u.transitionColors,
                  u.transitionColors,
                  u.bgPrimary85,
                  u.textWhite,
                  anim.className,
                )}
              >
                <div class={u.fontBold}>{anim.label}</div>
                <div class={cx(u.textSm, u.textWhite, u.mt1)}>{anim.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 10. 主题感知组件演示 —— 验证 antd 令牌过渡绑定 */}
        <section class={cx(u.themeCard, u.p5, u.mb3)}>
          <h3 class={cx(u.fontSemibold, u.textBase, u.mb1)}>
            10. 主题感知组件 —— antd 令牌也走过渡
          </h3>
          <p class={cx(u.textSm, u.textTextTertiary, u.mb3)}>
            <code class={u.fontMono}>themeCard</code> /{' '}
            <code class={u.fontMono}>themePrimaryBtn</code> 引用 themeContract vars。
            切换主题时背景 / 边框 / 文字颜色都跟着平滑过渡。
          </p>
          <div class={cx(u.flex, u.gap4, u.flexWrap)}>
            <button type="button" class={u.themePrimaryBtn}>
              themePrimaryBtn
            </button>
            <span
              class={cx(
                u.overlay({ tone: 'primary', size: 'sm', padding: 'sm' }),
                u.textWhite,
              )}
            >
              overlay: primary tone
            </span>
            <span
              class={cx(
                u.themeCard,
                u.inlineFlex,
                u.gap2,
                u.itemsCenter,
                u.textSm,
              )}
            >
              <span>themeCard 内部：</span>
              <span class={u.fontBold}>主题感知文字</span>
            </span>
          </div>
        </section>
      </PageContainer>
    )
  },
})