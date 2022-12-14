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
      <hr class="rounded">
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >

      <div class='editing' v-if="$store.state.user.isVerified"> 
        <button
          v-if="editing"
          @click="submitEdit"
        >
          💾 Save changes
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
      </div>

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

    <!-- INFO SECTION -->
    <p class="info">
      Posted at {{ freet.dateCreated }}
     </p>
    <p class="info" v-if="!(freet.dateCreated==freet.dateModified)">Edited at {{freet.dateModified}}</p>
    <p class="info" v-if="freet.endTime!='Invalid date'">
      This Freet will delete at {{  freet.endTime }}
    </p>
    <p class="info">Liked by: {{ freet.usersLiked.join(', ') }}</p>
  
    <!-- ADD LIKES (freet.usersLiked).includes() -->
    
    <button class="like" 
      v-if="!(freet.usersLiked).includes($store.state.username)" 
      @click="addLike">
      👍 Like
    </button>
    
    <button class="like" 
      v-if="(freet.usersLiked).includes($store.state.username)" 
      @click="deleteLike">
      💕 Liked
    </button>
   
    
    <!-- ALERTS -->
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
      liked: false,
      likes: this.freet.usersLiked,
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
      this.liked = true
      const params = {
        method: 'POST',
        message: 'Successfully liked Freet!',
        body: JSON.stringify({freetId: this.freet._id}),
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
      this.liking = true;
      this.liked = false;

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
        method: 'PUT',
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
      const freetID = await this.freet._id
      let url = `/api/freets/${freetID}`;
      try { 
        if (this.liking && this.liked) {
          url = `/api/freets/like/`;
        } 
        else if (this.liking && !this.liked) {
          url = `/api/freets/like/${freetID}`;
        } 
        const r = await fetch(url, options); 
        
        if (await !r.ok) { // if response unsuccessful 
          const res = await r.json();
          throw new Error(res.error);
        }
        
        this.editing = false;
        this.liking = false;
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
    border: 1px solid #00acee;
    border-radius: 15px;
    padding: 20px;
    margin-top: 15px;
    position: relative bottom;
}

article.freet:hover {
  background-color: #f8fcff;
}

h3 {
  color: #00acee;
}

.editing {
  display: inline;
  padding: 5px;
}
.info {
  color: rgb(186, 184, 184); 
  margin-top: 5px;
  font-family: monospace;
}

button {
  border-radius: 5px;
  border: 1px solid gray;
  margin-bottom: 5px;
}
.like {
  background-color: #ffeaf9;
}
.like:hover {
  background-color: #fffcd1;
  box-shadow: 2px 2px 3px lightgray;
}
hr.rounded {
  border-top: 1px solid #00acee;
}
</style>
