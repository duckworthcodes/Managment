const firebaseConfig = {
    apiKey: "AIzaSyARbW2lDKcZucJbo8lrwARvgax4Cy0NfuA",
    authDomain: "naaaabruh-ad282.firebaseapp.com",
    projectId: "naaaabruh-ad282",
    storageBucket: "naaaabruh-ad282.firebasestorage.app",
    messagingSenderId: "555946191902",
    appId: "1:555946191902:web:01ef40fb4e42acdf88120f",
    measurementId: "G-WWNFXHJ4XX"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore(app);

  // Enhanced chart configurations
  const chartOptions = {
    progress: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          bodyFont: {
            family: "'Plus Jakarta Sans', sans-serif"
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: "'Plus Jakarta Sans', sans-serif"
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: "'Plus Jakarta Sans', sans-serif"
            }
          }
        }
      }
    },
    resource: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              family: "'Plus Jakarta Sans', sans-serif"
            },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          bodyFont: {
            family: "'Plus Jakarta Sans', sans-serif"
          }
        }
      }
    }
  };

  // Fetch projects with enhanced error handling
  const fetchProjectsData = async () => {
    try {
      const snapshot = await db.collection('projects').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects data');
    }
  };

  // Generate alphabet buttons
  const generateAlphabetFilter = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const filterContainer = document.getElementById('alphabet-filter');
    filterContainer.innerHTML = 
      `<button class="alphabet-btn active" data-letter="all">All</button>
      ${alphabet.map(letter => 
        `<button class="alphabet-btn" data-letter="${letter}">${letter}</button>`
      ).join('')}`;

    // Add click handlers
    filterContainer.querySelectorAll('.alphabet-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterContainer.querySelectorAll('.alphabet-btn').forEach(b => 
          b.classList.remove('active')
        );
        btn.classList.add('active');
        updateDisplay();
      });
    });
  };

  // Modified filterAndSortProjects function
  const filterAndSortProjects = (projects, filterStatus, filterSprint, filterResource, sortBy) => {
    const selectedLetter = document.querySelector('.alphabet-btn.active').dataset.letter;
    const sortDirection = document.getElementById('sort-desc').classList.contains('active') ? -1 : 1;

    return projects
      .filter(p => {
        const statusMatch = filterStatus === 'all' || p.status === filterStatus;
        const sprintMatch = filterSprint === 'all' || p.sprint === filterSprint.replace('sprint', '');
        const resourceMatch = filterResource === 'all' || p.resources.includes(filterResource);
        const letterMatch = selectedLetter === 'all' || p.name.toUpperCase().startsWith(selectedLetter);
        return statusMatch && sprintMatch && resourceMatch && letterMatch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name': 
            return sortDirection * a.name.localeCompare(b.name);
          case 'progress': 
            return sortDirection * (b.progress - a.progress);
          case 'status': 
            return sortDirection * a.status.localeCompare(b.status);
          case 'sprint': 
            return sortDirection * (parseInt(a.sprint) - parseInt(b.sprint));
          default: 
            return 0;
        }
      });
  };

  // Modified displayProjects function
  const displayProjects = (projects) => {
    const projectListElement = document.getElementById('project-list');
    projectListElement.innerHTML = '';
  
    // Group projects by first letter
    const groupedProjects = projects.reduce((acc, project) => {
      const firstLetter = project.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(project);
      return acc;
    }, {});
  
    // Create and display groups
    Object.entries(groupedProjects)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([letter, letterProjects]) => {
        const groupElement = document.createElement('div');
        groupElement.classList.add('project-group');
        groupElement.innerHTML = `
          <div class="group-header">
            <span>Projects: ${letter}</span>
            <span class="project-count">${letterProjects.length} projects</span>
          </div>
          <div class="group-projects"></div>
        `;
  
        const groupProjectsContainer = groupElement.querySelector('.group-projects');
  
        letterProjects.forEach((project, index) => {
          const projectItem = document.createElement('div');
          projectItem.classList.add('project-item');
          
          const progressColor = project.status === 'completed' 
            ? 'var(--secondary-gradient)'
            : project.status === 'delayed'
              ? 'var(--danger-gradient)'
              : 'var(--warning-gradient)';
  
          projectItem.innerHTML = `
            <div class="project-info">
              <h4>${project.name}</h4>
              <div class="resources-list">Team: ${project.resources.join(', ')}</div>
            </div>
            <div class="sprint-badge">Sprint ${project.sprint}</div>
            <div class="progress-wrapper">
              <div class="progress-bar">
                <div class="progress-fill" style="width: 0%; background: ${progressColor}"></div>
              </div>
              <div style="text-align: center; margin-top: 0.5rem">${project.progress}%</div>
            </div>
            <div class="status-badge status-${project.status}">
              ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </div>
            <div class="project-actions">
              <button class="button edit-btn" data-id="${project.id}">Edit</button>
              <button class="button delete-btn" data-id="${project.id}">Delete</button>
            </div>
          `;
          
          groupProjectsContainer.appendChild(projectItem);
          
          // Animate project items
          gsap.fromTo(projectItem, 
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "power2.out"
            }
          );
  
          // Animate progress bars
          gsap.to(projectItem.querySelector('.progress-fill'), {
            width: `${project.progress}%`,
            duration: 1,
            delay: index * 0.1 + 0.3,
            ease: "power2.out"
          });
        });
  
        projectListElement.appendChild(groupElement);
      });
  
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const projectId = e.target.dataset.id;
        editProject(projectId);
      });
    });
  
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const projectId = e.target.dataset.id;
        deleteProject(projectId);
      });
    });
  };

  // Enhanced statistics display with animations
  const updateStats = (projects) => {
    const stats = {
      total: projects.length,
      ongoing: projects.filter(p => p.status === 'ongoing').length,
      completed: projects.filter(p => p.status === 'completed').length,
      delayed: projects.filter(p => p.status === 'delayed').length
    };

    Object.entries(stats).forEach(([key, value]) => {
      const element = document.getElementById(`${key}-projects`);
      gsap.to(element, {
        textContent: value,
        duration: 1,
        snap: { textContent: 1 },
        ease: "power2.out"
      });
    });
  };

  // Enhanced chart updates with animations
  const updateCharts = (projects) => {
    // Destroy existing charts
    Chart.getChart('progressChart')?.destroy();
    Chart.getChart('resourceChart')?.destroy();

    // Progress Chart
    new Chart(document.getElementById('progressChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: projects.map(p => p.name),
        datasets: [{
          data: projects.map(p => p.progress),
          backgroundColor: projects.map(p => {
            return p.status === 'completed' 
              ? 'rgba(34, 197, 94, 0.7)'
              : p.status === 'delayed'
                ? 'rgba(239, 68, 68, 0.7)'
                : 'rgba(245, 158, 11, 0.7)';
          }),
          borderColor: projects.map(p => {
            return p.status === 'completed'
              ? 'rgb(34, 197, 94)'
              : p.status === 'delayed'
                ? 'rgb(239, 68, 68)'
                : 'rgb(245, 158, 11)';
          }),
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: chartOptions.progress
    });

    // Resource Chart
    const resourceData = projects.reduce((acc, project) => {
      project.resources.forEach(resource => {
        acc[resource] = (acc[resource] || 0) + 1;
      });
      return acc;
    }, {});

    new Chart(document.getElementById('resourceChart').getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(resourceData),
        datasets: [{
          data: Object.values(resourceData),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(14, 165, 233, 0.8)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2
        }]
      },
      options: chartOptions.resource
    });
  };

  // Populate resource filter
  const populateResourceFilter = (projects) => {
    const resources = [...new Set(projects.flatMap(p => p.resources))].sort();
    const filterElement = document.getElementById('resource-filter');
    
    filterElement.innerHTML = '<option value="all">All Resources</option>' +
      resources.map(resource => 
        `<option value="${resource}">${resource}</option>`
      ).join('');
  };

  // Update display with loading animation
  const updateDisplay = async () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    
    try {
      const projects = await fetchProjectsData();
      const filters = {
        status: document.getElementById('status-filter').value,
        sprint: document.getElementById('sprint-filter').value,
        resource: document.getElementById('resource-filter').value,
        sortBy: document.getElementById('sort-by').value
      };
      
      const filteredProjects = filterAndSortProjects(
        projects,
        filters.status,
        filters.sprint,
        filters.resource,
        filters.sortBy
      );
      
      displayProjects(filteredProjects);
      updateStats(projects);
      updateCharts(filteredProjects);
    } catch (error) {
      console.error('Error updating display:', error);
    } finally {
      gsap.to(loadingOverlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          loadingOverlay.style.display = 'none';
          loadingOverlay.style.opacity = 1;
        }
      });
    }
  };

  // Add sort direction event listeners
  document.getElementById('sort-asc').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('sort-desc').classList.remove('active');
    updateDisplay();
  });

  document.getElementById('sort-desc').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('sort-asc').classList.remove('active');
    updateDisplay();
  });

  // Event listeners
  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', updateDisplay);
  });

  document.getElementById('refresh-data').addEventListener('click', () => {
    gsap.from('#refresh-data svg', {
      rotate: 360,
      duration: 1,
      ease: "power2.out"
    });
    updateDisplay();
  });

  document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Animate theme switch
    gsap.from('#dark-mode-toggle svg', {
      rotate: 180,
      duration: 0.5,
      ease: "back.out"
    });
  });

  // Modify the initialization to include alphabet filter
  document.addEventListener('DOMContentLoaded', async () => {
    generateAlphabetFilter();
    const projects = await fetchProjectsData();
    populateResourceFilter(projects);
    updateDisplay();
  });
  // Add Project Modal Logic
const addProjectBtn = document.getElementById('add-project-btn');
const addProjectModal = document.getElementById('add-project-modal');
const cancelProjectBtn = document.getElementById('cancel-project');
const projectForm = document.getElementById('project-form');

// Open Modal
addProjectBtn.addEventListener('click', () => {
  addProjectModal.style.display = 'flex';
});

// Close Modal
cancelProjectBtn.addEventListener('click', () => {
  addProjectModal.style.display = 'none';
});

// Handle Form Submission
projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const project = {
    name: document.getElementById('project-name').value,
    status: document.getElementById('project-status').value,
    sprint: document.getElementById('project-sprint').value,
    resources: document.getElementById('project-resources').value.split(',').map(res => res.trim()),
    progress: parseInt(document.getElementById('project-progress').value)
  };

  try {
    // Add project to Firestore
    await db.collection('projects').add(project);
    alert('Project added successfully!');
    addProjectModal.style.display = 'none';
    projectForm.reset();
    updateDisplay(); // Refresh the dashboard
  } catch (error) {
    console.error('Error adding project:', error);
    alert('Failed to add project. Please try again.');
  }
});
// Edit Project
const editProject = async (projectId) => {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    const project = projectDoc.data();
  
    // Open the modal with pre-filled data
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-status').value = project.status;
    document.getElementById('project-sprint').value = project.sprint;
    document.getElementById('project-resources').value = project.resources.join(', ');
    document.getElementById('project-progress').value = project.progress;
    addProjectModal.style.display = 'flex';
  
    // Update the form submission to handle editing
    projectForm.onsubmit = async (e) => {
      e.preventDefault();
  
      const updatedProject = {
        name: document.getElementById('project-name').value,
        status: document.getElementById('project-status').value,
        sprint: document.getElementById('project-sprint').value,
        resources: document.getElementById('project-resources').value.split(',').map(res => res.trim()),
        progress: parseInt(document.getElementById('project-progress').value)
      };
  
      try {
        await projectRef.update(updatedProject);
        alert('Project updated successfully!');
        addProjectModal.style.display = 'none';
        projectForm.reset();
        updateDisplay(); // Refresh the dashboard
      } catch (error) {
        console.error('Error updating project:', error);
        alert('Failed to update project. Please try again.');
      }
    };
  };
  
  // Delete Project
  const deleteProject = async (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await db.collection('projects').doc(projectId).delete();
        alert('Project deleted successfully!');
        updateDisplay(); // Refresh the dashboard
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };
  // Firebase Authentication
const auth = firebase.auth();

// Select the login button
const loginBtn = document.getElementById('login-btn');

// Function to handle login (assuming you have a form or method to log in the user)
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value; // Assuming you have an input field with ID 'email'
  const password = document.getElementById('password').value; // Assuming you have an input field with ID 'password'

  try {
    await auth.signInWithEmailAndPassword(email, password);
    console.log('User logged in successfully');
  } catch (error) {
    console.error('Error logging in:', error.message);
  }
});

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in, hide the login button
    loginBtn.style.display = 'none';
    console.log(`Welcome, ${user.email}!`);
  } else {
    // User is logged out, show the login button
    loginBtn.style.display = 'block';
  }
});
