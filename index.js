
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    setupNewPostForm();
});


async function loadPosts() {
    const postList = document.getElementById('post-list');
    
    try {
        
        const response = await fetch('http://localhost:3000/posts');
        const posts = await response.json();
        
        
        postList.innerHTML = '';
        
        
        updatePostCount(posts.length);
        
        
        if (posts.length === 0) {
            showNoPostsMessage();
            return;
        }
        
        
        posts.forEach(post => {
            displayPostInList(post);
        });
        
        
        if (posts.length > 0) {
            showPostDetails(posts[0].id);
        }
    } catch (error) {
        showError('Error loading posts:', error);
    }
}


function updatePostCount(count) {
    const counter = document.getElementById('post-count');
    counter.textContent = `${count} ${count === 1 ? 'post' : 'posts'}`;
}


function showNoPostsMessage() {
    const postList = document.getElementById('post-list');
    postList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>No Posts Yet</h3>
            <p>Create your first post using the form below</p>
        </div>
    `;
}


function displayPostInList(post) {
    const postList = document.getElementById('post-list');
    const postItem = document.createElement('div');
    
    
    const postDate = new Date(post.date || Date.now());
    const formattedDate = postDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    postItem.className = 'post-item';
    postItem.dataset.id = post.id;
    postItem.innerHTML = `
        <div class="post-title">${post.title}</div>
        <div class="post-meta">
            <span>${post.author}</span>
            <span>${formattedDate}</span>
        </div>
    `;
    
    
    postItem.addEventListener('click', function() {
        
        document.querySelectorAll('.post-item').forEach(item => {
            item.classList.remove('active');
        });
        
        postItem.classList.add('active');
        showPostDetails(post.id);
    });
    
    postList.appendChild(postItem);
}


async function showPostDetails(postId) {
    const postDetail = document.getElementById('post-detail');
    
    try {
        const response = await fetch(`http://localhost:3000/posts/${postId}`);
        const post = await response.json();
        
    
        const postDate = new Date(post.date || Date.now());
        const formattedDate = postDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        
        const imageHTML = post.image 
            ? `<div class="post-image-container">
                  <img src="${post.image}" alt="${post.title}" class="post-image loading"
                       onload="this.classList.remove('loading')"
                       onerror="this.style.display='none'">
               </div>`
            : '';
        
        
        postDetail.innerHTML = `
            <div class="post-detail-header">
                ${imageHTML}
                <h2 class="post-detail-title">${post.title}</h2>
                <div class="post-detail-meta">
                    By ${post.author} • ${formattedDate}
                </div>
            </div>
            <div class="post-detail-content">
                <p>${post.content}</p>
            </div>
            <div class="post-actions">
                <button class="btn btn-danger btn-delete" data-id="${post.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        
        postDetail.querySelector('.btn-delete').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this post?')) {
                deletePost(post.id);
            }
        });
    } catch (error) {
        showError('Error loading post details:', error);
    }
}


function setupNewPostForm() {
    const form = document.getElementById('new-post-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        
        const newPost = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            content: document.getElementById('content').value,
            image: document.getElementById('image').value.trim(),
            date: new Date().toISOString()
        };
        
        
        if (newPost.image && !isValidImageUrl(newPost.image)) {
            showMessage('Please enter a valid image URL (jpg, png, gif, webp, svg)', 'error');
            return;
        }
        
        try {
            
            const response = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPost)
            });
            
            if (response.ok) {
                
                form.reset();
                loadPosts();
                showMessage('Post created successfully!', 'success');
            } else {
                throw new Error('Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            showMessage('Error creating post. Please try again.', 'error');
        }
    });
}


function isValidImageUrl(url) {
    if (!url) return true; 
    try {
        new URL(url); 
        return url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) != null;
    } catch {
        return false;
    }
}


async function deletePost(postId) {
    try {
        const response = await fetch(`http://localhost:3000/posts/${postId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            
            loadPosts();
            document.getElementById('post-detail').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trash"></i>
                    <h3>Post Deleted</h3>
                    <p>Select another post to view details</p>
                </div>
            `;
            showMessage('Post deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showMessage('Error deleting post. Please try again.', 'error');
    }
}


function showError(message, error) {
    const postList = document.getElementById('post-list');
    postList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Something Went Wrong</h3>
            <p>${message}</p>
        </div>
    `;
    console.error(message, error);
}


function showMessage(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    
    setTimeout(function() {
        notification.classList.add('hidden');
    }, 3000);
}