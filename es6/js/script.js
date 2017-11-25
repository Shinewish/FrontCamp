"use strict"

class State {
    constructor(config) {
        const { apiKey } = config;
        this._apiKey = apiKey;
        this._articles = [];
        this._sources = [];
    }

    get apiKey() {
        return this._apiKey;
    }

    get articles() {
        return this._articles;
    }

    set articles (articles) {
        this._articles = articles;
    }
    
    get sources() {
        return this._sources;
    }

    set sources (sources) {
        this._sources = sources;
    }
}

const controller ={
    init() {
        this.fetchSources()
            .then(response => {
                state.sources = response.sources.slice(0, 6);
                return response.sources[0].id;        
            })
            .then(source => this.fetchArticles(source))
            .then(articles => state.articles = articles)            
            .catch()
            .then(menuComponent.init.bind(menuComponent))
            .then(articlesComponent.init.bind(articlesComponent));
    },
      
    fetchArticles(source) {
        const { apiKey } = state;
        return fetch(`https://newsapi.org/v2/top-headlines?language=en&sources=${source}&apiKey=${apiKey}`)
            .then((responce) => {
                if (!responce.ok) {
                    throw new Error(`Code: ${responce.message}\n Message: ${responce.message}`);
                }
                return responce.json();
            })
            .then(response => response.articles);
    },

    fetchSources() {
        const { apiKey } = state;    
        return fetch(`https://newsapi.org/v2/sources?apiKey=${apiKey}`)
            .then((responce) => {
                if (!responce.ok) {
                    throw new Error(`Code: ${responce.message}\n Message: ${responce.message}`);
                }
                return responce.json();
            })
    },
}

const articlesComponent = {
    init() {
        this.$ul = document.getElementById('news');
        this.render();
    },
  
    formatData(publishedAt) {
        const date = new Date(publishedAt);
        const formatter = new Intl.DateTimeFormat("en-US",{
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        return formatter.format(date);
    },
  
    fillTemplate(post) {
        const li = document.createElement('li');
        li.innerHTML = `
            <p class="widget-title">${this.formatData(post.publishedAt)}</p>
            <div>
                <a href=${post.url}>
                    <img class="entity-thumbnail" src=${post.urlToImage}></img>
                    <h3 class="entity-title">${post.title}</h3>
                </a>
            </div>
            <p class="entity-summary">${post.description}</p>
        `
        return li;
    },

    fillEmptyTemplate() {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <h3 class="entity-title">No news available =(</h3>
            </div>
            <p class="entity-summary">Please, try any other source.</p>
        `
        return li;
    },
    
    render() {
        this.$ul.innerHTML = "";
        if (!state.articles[0]) {
            this.$ul.appendChild(this.fillEmptyTemplate());
        }
        state.articles.forEach(
            post => this.$ul.appendChild(this.fillTemplate(post))
        );
    },
}

const menuComponent = {
    init() {
        this.$ul = document.getElementById('menu');
        this.$ul.addEventListener('click',this.handleMenuItemClick);
        this.render();
    },
    
    handleMenuItemClick(event){
        const source = event.target.getAttribute('class');
        controller.fetchArticles(source)
            .then(articles => state.articles = articles)
            .catch()
            .then(articlesComponent.render.bind(articlesComponent));
    },
  
    render() {
        state.sources.forEach(source => {
            const li = document.createElement('li');
            li.innerHTML = source.name;
            li.setAttribute('class', source.id);
            this.$ul.appendChild(li);
        })
    },
}

const config = {
    apiKey: 'f6e0d7be29414407b5c88c603e90e038',
};
const state = new State(config);

controller.init();