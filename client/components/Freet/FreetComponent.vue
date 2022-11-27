<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author">
        @{{ freet.author }}
      </h3>
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button
          v-if="editing"
          @click="submitEdit"
        >
          ✅ Save changes
        </button>
        <button
          v-if="editing"
          @click="stopEditing"
        >
          🚫 Discard changes
        </button>
        <button
          v-if="!editing"
          @click="startEditing"
        >
          ✏️ Edit
        </button>
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>
    </header>
    <textarea
      v-if="editing"
      class="content"
      :value="draft"
      @input="draft = $event.target.value"
    />
    <p
      v-else
      class="content"
    >
      {{ freet.content }}
    </p>

    <p class="info">
      Posted at {{ freet.dateModified }}
      <i v-if="freet.edited">(edited)</i>
    </p>
    <p class="info" v-if="freet.endTime!='Invalid date'">
      This Freet will delete at {{  freet.endTime }}
    </p>
    <p class="info">
    Liked by: {{ freet.usersLiked }}
    </p>
   <!-- ADD LIKES -->
    <button class="button" v-if="!freet.usersLiked.includes($store.state.username)" @click="addLike">
      👍 Like
    </button>
    
    <button class="button" v-if="freet.usersLiked.includes($store.state.username)" @click="deleteLike">
      💕 Liked
    </button>

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
  name: 'FreetComponent',
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editing: false, // Whether or not this freet is in edit mode
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {}, // Displays success/error messages encountered during freet modification
      liking: false,
      unliking: false,
      likes: this.freet.usersLiked
    };
  },
  methods: {
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    addLike() {
      /**
       * Add like to freet
       */
      this.liking = true;
      this.likes.push(this.$store.state.username);
      const params = {
        method: 'POST',
        message: 'Successfully liked Freet!',
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },

    deleteLike() {
      /**
       * Delete like from freet
       */
      this.unliking = true;
      var index = this.likes.indexOf(this.$store.state.username);
      this.likes.splice(index, this.$store.state.username);
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted like!', status: 'success'
          });
        }
      };
      this.request(params);
    },

    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }
      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify({content: this.draft}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
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
      
      try { 
        if (this.liking = true) {
          const r = await fetch(`/api/freets/like/`, options);
        } else if (this.unliking = true) {
          const r = await fetch(`/api/freets/like/${this.freet._id}`, options);
        } else {
          const r = await fetch(`/api/freets/${this.freet._id}`, options);
        }
        console.log(this.liking)
        console.log(this.unliking)
        
        if (await !r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.liking = false;
        this.unliking = false;
        this.$store.commit('refreshFreets');

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
html * {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
.freet {
    border: 2px dashed #8b9bdf;
    border-radius: 15px;
    padding: 20px;
    margin-top: 15px;
    position: relative;
}

h3 {
  color: navy;
}

.info {
  color: rgb(135, 135, 135); 
  margin-top: 5px;
}

.button {
  background-color: #c2c8e1;
  border: 1px solid;
  border-radius: 5px;
}
.button:hover {
  background-color: rgb(255, 252, 208);
}
</style>
