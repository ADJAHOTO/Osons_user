<script setup>
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'

defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  newComment: {
    type: String,
    default: ''
  },
  isSubmittingComment: {
    type: Boolean,
    default: false
  },
  reactingComments: {
    type: Set,
    default: () => new Set()
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:new-comment', 'submit-comment', 'react-comment',
  'comment-deleted','comment-updated'
])
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
      <h3 class="text-2xl font-bold text-white flex items-center">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        Commentaires ({{ comments.length }})
      </h3>
    </div>

    <CommentForm
      :new-comment="newComment"
      :is-submitting="isSubmittingComment"
      :users="users"
      @update:new-comment="(value) => $emit('update:new-comment', value)"
      @submit="$emit('submit-comment')"
    />

    <div class="max-h-96 overflow-y-auto">
      <div v-if="comments.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <p class="text-gray-500 text-lg">Soyez le premier à commenter !</p>
        <p class="text-gray-400 text-sm mt-2">Partagez votre opinion sur cet événement</p>
      </div>

      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :users="users"
        :comment="comment"
        :reacting-comments="reactingComments"
        :timeAgo="timeAgo"
        @react="(commentId, reactionType) => $emit('react-comment', commentId, reactionType)"
        @comment-deleted="emit('comment-deleted', $event)"
        @comment-updated="emit('comment-updated', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>