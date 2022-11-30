
<script>
import BlockForm from '@/components/common/BlockForm.vue';
import FreetComponent from '@/components/Freet/FreetComponent.vue';
export default {
  name: 'CreateCommentForm',
  mixins: [BlockForm],
  // props: {
  //   freet: {
  //     type: Object,
  //     required: true
  //   }
  // },
  components: {FreetComponent},
  data() {
    return {
      url: '/api/comment',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'content', label: 'Content', value: '' },
      ],
      title: 'Add a comment',
      refreshFreets: true,
      callback: () => {
        const message = 'Successfully added a comment!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
