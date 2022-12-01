<template>
  <article class="comment">
    <header>
      <h3 class="author">
        @{{ comment.author }}
      </h3>
      <div
        v-if="$store.state.username === comment.author"
        class="actions">
        <button @click="deleteComment">
          🗑️ Delete
        </button>
      </div>
    </header>

    <textarea
      class="content"
      :value="draft"
      @input="draft = $event.target.value"
    />
   
    <p class="info">
      Posted at {{ dateCreated }}
    </p>
   
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>

  </article>
</template>

<script>
export default {
  name: 'CommentComponent',
  props: {
    // Data from the stored comment
    comment: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      draft: this.comment.content, // content for this comment
      alerts: {}, // Displays success/error messages encountered
    };
  },
  methods: {
    deleteComment() {
      /**
       * Deletes this comment.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted comment!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    addComment() {
      /**
       * Adds this coment
       */
      const params = {
        method: 'POST',
        message: 'Successfully added comment!',
        body: JSON.stringify({commentContent: this.draft, freetId: this.freetId }), // body needs freetId, commentContent
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      console.log(params);
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }
      const commentId = await this.freet._id;
      // let url = `/api/comment/${commentId}`;
      // const posting = (params.method === 'POST');
      console.log(params.method);
      try {
        const r = await fetch(`/api/comment/${this.comment._id}`, options);
        // if (posting) {
        //   url = `/api/comment/`;
        // } 
        // else {
        //   url = `/api/comment/${commentId}`;
        // } 
        // const r = await fetch(url, options); 
        console.log(r)
        
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
.comment {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
