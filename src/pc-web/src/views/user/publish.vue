<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { HttpError } from '@/services/http/create-http-client'
import { aiOnlineFill, createResource } from '@/services/modules/resources'
import { uploadPublishImage } from '@/services/modules/uploads'
import { useAuthStore } from '@/stores/auth'
import JSZip from 'jszip'
import { marked } from 'marked'

defineOptions({
  name: 'PublishView',
})

const authStore = useAuthStore()

const PUBLISH_DRAFT_KEY = 'resource-hub.publish.draft'

const form = reactive({
  title: '',
  category: '',
  content: '',
  shareLink: '',
  tags: '',
  screenshotObjectKey: '',
  screenshotUrl: '',
})

const imageInput = ref<HTMLInputElement | null>(null)
const imagePreviewUrl = ref('')
const isUploadingImage = ref(false)
const isSubmitting = ref(false)
const isSavingDraft = ref(false)
const imageUploadError = ref('')
const uploadedImageName = ref('')
const submitError = ref('')
const submitSuccess = ref('')
const activeTab = ref('manual')
const aiContent = ref('')
const isAiProcessing = ref(false)
const aiError = ref('')
const contentTextarea = ref<HTMLTextAreaElement | null>(null)
const showPreview = ref(false)
const renderedContent = computed(() => marked(form.content) as string)

const normalizedTags = computed(() =>
  form.tags
    .split(/[,\n/|，]/)
    .map((tag) => tag.trim())
    .filter(Boolean),
)

const revokePreview = () => {
  if (imagePreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
}

const resetForm = () => {
  form.title = ''
  form.category = ''
  form.content = ''
  form.shareLink = ''
  form.tags = ''
  form.screenshotObjectKey = ''
  form.screenshotUrl = ''
  uploadedImageName.value = ''
  imageUploadError.value = ''
  revokePreview()
  imagePreviewUrl.value = ''
}

const autoResizeTextarea = () => {
  const ta = contentTextarea.value
  if (ta) {
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }
}

const insertMd = (before: string, after: string) => {
  const ta = contentTextarea.value
  if (!ta) return

  const start = ta.selectionStart
  const end = ta.selectionEnd
  const selected = form.content.substring(start, end)
  const newText = before + selected + after
  form.content = form.content.substring(0, start) + newText + form.content.substring(end)

  setTimeout(() => {
    ta.focus()
    const newCursorPos = selected ? start + newText.length : start + before.length
    ta.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

const openImagePicker = () => {
  imageInput.value?.click()
}

const onSelectImage = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  imageUploadError.value = ''
  uploadedImageName.value = file.name
  revokePreview()
  imagePreviewUrl.value = URL.createObjectURL(file)
  isUploadingImage.value = true

  try {
    const uploaded = await uploadPublishImage(file)
    form.screenshotObjectKey = uploaded.objectKey
    form.screenshotUrl = uploaded.url ?? ''

    if (uploaded.url) {
      revokePreview()
      imagePreviewUrl.value = uploaded.url
    }
  } catch (error) {
    form.screenshotObjectKey = ''
    form.screenshotUrl = ''
    imageUploadError.value =
      error instanceof HttpError ? error.message : '截图上传失败，请稍后重试'
  } finally {
    isUploadingImage.value = false
    target.value = ''
  }
}

const validateForm = () => {
  if (!form.title.trim()) {
    return '请填写资源名称'
  }

  if (!form.category.trim()) {
    return '请选择资源分类'
  }

  if (!form.shareLink.trim()) {
    return '请填写 123 云盘分享链接'
  }

  if (!form.content.trim()) {
    return '请填写详细说明'
  }

  if (!form.screenshotObjectKey.trim()) {
    return '请先上传网盘内容截图'
  }

  return ''
}

const saveDraft = () => {
  localStorage.setItem(
    PUBLISH_DRAFT_KEY,
    JSON.stringify({
      ...form,
      uploadedImageName: uploadedImageName.value,
      imagePreviewUrl: imagePreviewUrl.value,
    }),
  )
}

const onSaveDraft = () => {
  isSavingDraft.value = true
  submitError.value = ''
  submitSuccess.value = ''

  try {
    saveDraft()
    submitSuccess.value = '草稿已保存到本地'
  } finally {
    isSavingDraft.value = false
  }
}

const downloadSkill = async () => {
  try {
    const userId = authStore.profile?.id
    if (!userId) {
      window.alert('请先登录')
      return
    }

    const [skillMdRes, scriptRes] = await Promise.all([
      fetch('/skills/resource-hub-upload/SKILL.md'),
      fetch('/skills/resource-hub-upload/scripts/resource-upload.js'),
    ])

    if (!skillMdRes.ok || !scriptRes.ok) {
      throw new Error('Skill 文件获取失败')
    }

    const [skillMd, script] = await Promise.all([
      skillMdRes.text(),
      scriptRes.text(),
    ])

    const replacedSkillMd = skillMd.replace(/\{\{USER_KEY\}\}/g, userId)
    const replacedScript = script.replace(/\{\{USER_KEY\}\}/g, userId)

    const zip = new JSZip()
    zip.file('SKILL.md', replacedSkillMd)
    zip.file('scripts/resource-upload.js', replacedScript)

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `resource-hub-upload-${userId.slice(0, 8)}.zip`
    a.click()
    URL.revokeObjectURL(url)

    window.alert('Skill 已下载，请配置到你的 AI 编程工具中')
  } catch (e) {
    window.alert(e instanceof Error ? e.message : '下载失败，请重试')
  }
}

const onAiAssist = async () => {
  if (!aiContent.value.trim()) {
    aiError.value = '请填写关键信息'
    return
  }

  aiError.value = ''
  submitSuccess.value = ''
  submitError.value = ''
  isAiProcessing.value = true

  try {
    const result = await aiOnlineFill({
      keyInfo: aiContent.value.trim(),
    })

    form.title = result.title || form.title
    form.category = result.category || form.category
    if (Array.isArray(result.tags)) {
      form.tags = result.tags.join(' / ')
    }
    form.content = result.contentMd || form.content

    submitSuccess.value = 'AI 已完成回填，请检查并补充信息'
    activeTab.value = 'manual'
  } catch (e) {
    aiError.value = e instanceof HttpError ? e.message : '处理失败，请稍后重试'
  } finally {
    isAiProcessing.value = false
  }
}

const onSubmit = async () => {
  submitError.value = ''
  submitSuccess.value = ''

  const validationMessage = validateForm()
  if (validationMessage) {
    submitError.value = validationMessage
    return
  }

  isSubmitting.value = true

  try {
    const resource = await createResource({
      title: form.title.trim(),
      category: form.category.trim(),
      shareLink: form.shareLink.trim(),
      contentMd: form.content.trim(),
      tags: normalizedTags.value,
      screenshotObjectKey: form.screenshotObjectKey.trim(),
      screenshotUrl: form.screenshotUrl || undefined,
    })

    localStorage.removeItem(PUBLISH_DRAFT_KEY)
    submitSuccess.value = `资源已提交审核，当前状态：${resource.status}`
    resetForm()
  } catch (error) {
    submitError.value =
      error instanceof HttpError ? error.message : '提交失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  const rawDraft = localStorage.getItem(PUBLISH_DRAFT_KEY)
  if (!rawDraft) {
    return
  }

  try {
    const draft = JSON.parse(rawDraft) as Partial<typeof form> & {
      uploadedImageName?: string
      imagePreviewUrl?: string
    }

    form.title = draft.title ?? ''
    form.category = draft.category ?? ''
    form.content = draft.content ?? ''
    form.shareLink = draft.shareLink ?? ''
    form.tags = draft.tags ?? ''
    form.screenshotObjectKey = draft.screenshotObjectKey ?? ''
    form.screenshotUrl = draft.screenshotUrl ?? ''
    uploadedImageName.value = draft.uploadedImageName ?? ''
    imagePreviewUrl.value = draft.imagePreviewUrl ?? draft.screenshotUrl ?? ''
  } catch {
    localStorage.removeItem(PUBLISH_DRAFT_KEY)
  }
})

onBeforeUnmount(() => {
  revokePreview()
})
</script>

<template>
  <div class="w-full">
    <main class="px-6 py-10">
      <!-- Header / Title Section -->
      <header class="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
          <h1 class="text-2xl font-bold tracking-tight">发布新资源</h1>
        </div>

      </header>

      <div class="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          :class="['flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all', activeTab === 'manual' ? 'bg-white shadow-sm text-primary dark:bg-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']"
          type="button"
          @click="activeTab = 'manual'"
        >
          手动录入
        </button>
        <button
          :class="['flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all', activeTab === 'ai' ? 'bg-white shadow-sm text-primary dark:bg-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']"
          type="button"
          @click="activeTab = 'ai'"
        >
          AI 在线录入
        </button>
        <button
          :class="['flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all', activeTab === 'skill' ? 'bg-white shadow-sm text-primary dark:bg-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']"
          type="button"
          @click="activeTab = 'skill'"
        >
          Skill 录入
        </button>
      </div>

      <!-- Tab: Manual Entry -->
      <div v-show="activeTab === 'manual'">

      <div v-if="submitSuccess" class="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300">
        {{ submitSuccess }}
      </div>
      <div v-if="submitError" class="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {{ submitError }}
      </div>

      <!-- Basic Info Section -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="md:col-span-2 space-y-6">
            <div>
              <label class="block text-sm font-semibold mb-2">资源名称</label>
              <input
                v-model="form.title"
                class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="例如：VS Code 增强插件集"
                type="text"
              >
            </div>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <label class="block text-sm font-semibold mb-2">消耗积分 (固定)</label>
                <div class="flex items-center px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                  <span class="material-symbols-outlined text-sm mr-2">database</span>
                  <span class="font-medium">5 积分</span>
                </div>
              </div>
              <div class="flex-1">
                <label class="block text-sm font-semibold mb-2">资源分类</label>
                <select
                  v-model="form.category"
                  class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none"
                >
                  <option value="">请选择</option>
                  <option>开发工具</option>
                  <option>辅助插件</option>
                  <option>系统优化</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">123 云盘分享链接</label>
              <input
                v-model="form.shareLink"
                class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="请输入完整的 123 云盘分享地址"
                type="url"
              >
              <p class="mt-2 text-xs text-slate-500">
                链接内已携带访问凭证时，无需再单独填写提取码。
              </p>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">标签</label>
              <input
                v-model="form.tags"
                class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="例如：提示词 / 模板 / 教程"
                type="text"
              >
            </div>
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-semibold mb-2">网盘内容截图</label>
            <input
              ref="imageInput"
              accept="image/*"
              class="hidden"
              type="file"
              @change="onSelectImage"
            >
            <button
              class="relative w-full group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl aspect-square flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 hover:border-primary/50 transition-all overflow-hidden text-left"
              type="button"
              @click="openImagePicker"
            >
              <img
                v-if="imagePreviewUrl"
                :src="imagePreviewUrl"
                alt="网盘内容截图预览"
                class="absolute inset-0 h-full w-full object-cover"
              >
              <div
                :class="[
                  'relative z-10 flex flex-col items-center justify-center px-4 text-center transition-all',
                  imagePreviewUrl ? 'bg-slate-950/55 text-white w-full py-5 mt-auto' : 'text-slate-500',
                ]"
              >
                <div
                  :class="[
                    'w-16 h-16 rounded-lg flex items-center justify-center mb-2',
                    imagePreviewUrl ? 'bg-white/15 backdrop-blur-sm' : 'bg-slate-200 dark:bg-slate-700',
                  ]"
                >
                  <span :class="['material-symbols-outlined', imagePreviewUrl ? 'text-white' : 'text-slate-400']">image</span>
                </div>
                <span class="text-xs font-medium">
                  {{ imagePreviewUrl ? '重新上传网盘截图' : '上传 123 云盘文件列表截图' }}
                </span>
                <span class="mt-1 text-[11px] opacity-80">
                  {{ isUploadingImage ? '上传中...' : '用于展示资源内容，支持 PNG / JPG / WEBP' }}
                </span>
              </div>
            </button>
            <p v-if="uploadedImageName" class="mt-3 text-xs text-slate-500">
              当前文件：{{ uploadedImageName }}
            </p>
            <p v-if="form.screenshotObjectKey" class="mt-2 text-xs text-green-600 dark:text-green-400 break-all">
              已上传：{{ form.screenshotObjectKey }}
            </p>
            <p v-if="imageUploadError" class="mt-2 text-xs text-red-500">
              {{ imageUploadError }}
            </p>
          </div>
        </section>

        <!-- Markdown Content Editor -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-lg font-bold">详细说明</label>
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex gap-2">
              <button class="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" type="button" title="粗体" @click="insertMd('**', '**')">
                <span class="material-symbols-outlined text-sm">format_bold</span>
              </button>
              <button class="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" type="button" title="斜体" @click="insertMd('*', '*')">
                <span class="material-symbols-outlined text-sm">format_italic</span>
              </button>
              <button class="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" type="button" title="链接" @click="insertMd('[', '](url)')">
                <span class="material-symbols-outlined text-sm">link</span>
              </button>
              <button class="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" type="button" title="无序列表" @click="insertMd('- ', '')">
                <span class="material-symbols-outlined text-sm">format_list_bulleted</span>
              </button>
              <button class="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" type="button" title="有序列表" @click="insertMd('1. ', '')">
                <span class="material-symbols-outlined text-sm">format_list_numbered</span>
              </button>
              <button class="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" type="button" title="代码" @click="insertMd('`', '`')">
                <span class="material-symbols-outlined text-sm">code</span>
              </button>
              <button class="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" type="button" title="引用" @click="insertMd('> ', '')">
                <span class="material-symbols-outlined text-sm">format_quote</span>
              </button>
              <div class="flex-1"></div>
              <button :class="['p-2 rounded transition-colors', showPreview ? 'bg-primary/10 text-primary' : 'hover:bg-slate-200 dark:hover:bg-slate-700']" type="button" title="预览" @click="showPreview = !showPreview">
                <span class="material-symbols-outlined text-sm">visibility</span>
              </button>
            </div>
            <div class="flex" :class="showPreview ? 'h-[500px]' : 'h-auto'">
              <textarea
                ref="contentTextarea"
                v-model="form.content"
                :class="['flex-1 p-6 bg-white dark:bg-slate-900 border-none focus:ring-0 text-base leading-relaxed resize-none font-mono', showPreview ? 'border-r border-slate-200 dark:border-slate-800' : '']"
                placeholder="支持 Markdown 语法，详细介绍软件的功能、安装步骤及注意事项..."
                @input="autoResizeTextarea"
              ></textarea>
              <div v-if="showPreview" class="flex-1 p-6 overflow-y-auto prose prose-slate dark:prose-invert max-w-none">
                <div v-if="form.content" v-html="renderedContent"></div>
                <p v-else class="text-slate-400">预览区域</p>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-primary mt-0.5">info</span>
              <div class="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-6">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white">发布说明</h2>
                <p>平台不再维护资源版本，也不会要求上传安装包文件。资源实际内容以 123 云盘链接中的文件为准。</p>
                <p>如果后续网盘内容有更新，请同步更新资源说明和截图，确保用户看到的展示信息与实际内容一致。</p>
              </div>
            </div>
          </div>
        </section>

      <footer class="mt-12 flex justify-end gap-4 pt-10 border-t border-slate-200 dark:border-slate-800 mb-20">
        <button class="px-8 py-3 rounded-lg border border-slate-300 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60" type="button" @click="onSaveDraft">
          {{ isSavingDraft ? '保存中...' : '保存为草稿' }}
        </button>
        <button class="px-10 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-60" type="button" :disabled="isSubmitting || isUploadingImage" @click="onSubmit">
          {{ isSubmitting ? '提交中...' : '正式发布并提交审核' }}
        </button>
      </footer>
      </div>

      <!-- Tab: AI Online Entry -->
      <div v-show="activeTab === 'ai'" class="space-y-6">
        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">AI 在线录入</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
            输入关键信息（支持多行），AI 会整理标题、分类、标签和说明后回填表单。
          </p>
          <div class="space-y-4">
            <textarea
              v-model="aiContent"
              class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y min-h-[160px]"
              placeholder="示例：\n- 资源名称：VS Code 增强插件集\n- 内容：主题、图标、快捷键配置\n- 适用人群：前端开发\n- 特色：提升开发效率\n- 相关链接：https://xxx"
            ></textarea>
            <button
              class="px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
              type="button"
              :disabled="isAiProcessing"
              @click="onAiAssist"
            >
              {{ isAiProcessing ? '处理中...' : 'AI 生成并回填' }}
            </button>
          </div>
          <p v-if="aiError" class="mt-3 text-sm text-red-500">{{ aiError }}</p>
        </section>
      </div>

      <!-- Tab: Skill Entry -->
      <div v-show="activeTab === 'skill'">
        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">AI Skill 录入</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                下载 Skill 包，让另一个 AI 帮你整理资源信息。
              </p>
            </div>
            <button
              class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              @click="downloadSkill"
            >
              <span class="material-symbols-outlined text-sm">download</span>
              下载 Skill 包
            </button>
          </div>

          <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <h3 class="mb-2 font-semibold text-slate-700 dark:text-slate-200">使用说明</h3>
            <ol class="list-inside list-decimal space-y-1">
              <li>点击"下载 Skill 包"，包含 SKILL.md 和脚本文件（已自动替换为你的 userKey）</li>
              <li>将下载的 Skill 配置到你的 AI 编程工具中</li>
              <li>复制分享链接和截图信息给 AI，让它帮你整理资源元数据</li>
              <li>AI 会调用脚本自动创建资源</li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
