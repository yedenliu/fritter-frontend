<template>
    <div class="container">
      <Blog />
      <!-- add this -->
      <add-comment />
    </div>
  </template>
  
  <script>
  // other import component
  import AddComment from '@/components/AddComment.vue'; // add this
  export default {
    name: 'App',
    components: {
      // blog component
      AddComment // add this
    }
  </script>
  <style>
  /* styles for the page */
  </style>