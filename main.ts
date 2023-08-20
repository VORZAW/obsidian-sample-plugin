import { App, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';


export default class ChooseFromList extends Plugin {
  async onload() {
    let selected_list_item: HTMLElement | null
    this.registerDomEvent(window, "auxclick", (ev) => {
      const x = ev.clientX
      const y = ev.clientY
      let element = document.elementFromPoint(x, y)
      
      if (!element) {
        selected_list_item = null
        return
      }
      
      if (element.parentElement?.classList.contains("HyperMD-list-line")) {
        element = element.parentElement
      } else {
        selected_list_item = null
        return
      }
      selected_list_item = element as HTMLElement
    })

    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu) => {
        if (!selected_list_item) { return }

        menu.addItem((item) => {
          item
            .setTitle("Pick random item from list")
            .setIcon("shuffle")
            .onClick(() => {
              const options = this.getAjacentsListElements(selected_list_item as HTMLElement)
              const text_options = options.map((value) => {
                const text = value.textContent
                if (!text) {
                  console.error("failed to find text in: ", value)
                  return "Undefined"
                }
                return text
              })

              new ChoosedShowModal(
                this.app,
                text_options
              ).open()
            })
        })
      })
    )
  }

  getAjacentsListElements(element: HTMLElement): HTMLElement[] {
    const options = [element]

    let prev_el = element?.previousElementSibling as HTMLElement
    for (let i = 0; i < 100; i++) {
      if (!prev_el?.classList.contains("HyperMD-list-line")) {
        break
      }
      options.push(prev_el)
      prev_el = prev_el.previousElementSibling as HTMLElement
    }

    let next_el = element?.nextElementSibling as HTMLElement
    for (let i = 0; i < 100; i++) {
      if (!next_el?.classList.contains("HyperMD-list-line")) {
        break
      }
      options.push(next_el)
      next_el = next_el.nextElementSibling as HTMLElement
    }
    
    return options
  }
}

class ChoosedShowModal extends Modal {
  options: string[]
  constructor(app: App, options: string[]) {
    super(app)
    this.options = options
  }

  onOpen(): void {
    const { contentEl } = this;

    const displayOption = contentEl.createEl("h1", {text: this.pickRandomOption()})
    displayOption.style.height = "170px"

    const randomizeBtn = contentEl.createEl("button", {text: "Pick again"})
    randomizeBtn.onClickEvent((ev) => {
      displayOption.setText(this.pickRandomOption())
      this.options
    })
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  pickRandomOption(): string {
    const random = Math.random()
    const index = Math.floor(random * this.options.length)
    const result = this.options[index]
    return result
  }
}
