class InfiniteScroll {
  constructor(containerElement, dataArray, itemsPerPage, objelement, template) {
    this.containerElement = containerElement;

    this.dataArray = dataArray;

    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.currentNum = 0;
    this.isLoading = false;
    this.lastScrollTop = 0;

    this.objelement = objelement;
    this.template = template;

    // Agrega un evento de scroll al elemento contenedor deseado.
    this.containerElement.addEventListener("scroll", () => {
      if (!this.isLoading && this.isAtBottom() && this.isScrollingDown()) {
        this.loadMoreItems();
      }
    });

    // Carga los primeros 5 elementos al iniciar la página.
    this.loadMoreItems();
  }

  isAtBottom() {
    const container = this.containerElement;
    return (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 20 // Ajusta este valor según tus necesidades
    );
  }

  isScrollingDown() {
    const container = this.containerElement;
    const scrollTop = container.scrollTop;
    const isScrollingDown = scrollTop > this.lastScrollTop;
    this.lastScrollTop = scrollTop;
    return isScrollingDown;
  }

  async loadMoreItems() {
    this.isLoading = true;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const newItems = this.dataArray.slice(startIndex, endIndex);

    if (newItems.length > 0) {
      this.currentPage++;
      // Aquí puedes hacer lo que necesites con los nuevos elementos, como mostrarlos en la página.
      await this.renderItems(newItems);
    } else {
      // console.log("Ya no hay más elementos para cargar.");
    }

    this.isLoading = false;
  }

  async renderItems(items) {
    // Implementa la lógica para mostrar los elementos en tu página.
    // Puedes agregarlos al DOM, por ejemplo.
    for (const item of items) {
      this.currentNum++;
      this.objelement.innerHTML += await this.template(item, this.currentNum);
    }
  }
}