import type { Meta, StoryObj } from '@storybook/vue3'

import BlockLogo from './BlockLogo.vue'

const meta = {
  title: 'BlockLogo',
  component: BlockLogo,

  tags: ['autodocs'],

  argTypes: {
    to: {
      control: 'text',
      description: 'The route to link to'
    },
    title: {
      control: 'text',
      description: 'The title of the component'
    }
  }
} satisfies Meta<typeof BlockLogo>

export default meta
type Story = StoryObj<typeof meta>

export const BlockLogoStory: Story = {
  args: {
    logo: {
        sourceUrl: "https://mock-api.funkhaus.us/wp-content/uploads/2021/01/award-webbys.svg"

    }
  },
  render(args) {
    return {
      components: { BlockLogo },
      setup: () => ({ args }),

      template: `<div>
        <h1>BlockLogo Demo</h1>
        <BlockLogo :logo='args.logo.sourceUrl' />
      </div>`
    }
  }
}
