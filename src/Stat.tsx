import { Encoding } from './App';
import { modelToEncodingMap, ModelName } from 'gpt-tokenizer/mapping';
interface StatProps {
  label: string;
  displayValue: string | number;
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type Price = Record<ModelName, {
  description: string;
  price: number | {
    prompt: number;
    completion: number;
  }
}>
const pricePerToken: Price  = {
  'gpt-3.5-turbo': {
    description: 'GPT-3.5 Turbo Chat',
    price: 0.006 / 1000
  },
  'gpt-4': {
    description: 'GPT-4 Chat',
    price: {
      prompt: 0.03 / 1000,
      completion: 0.06 / 1000,
    }
  },
  'gpt-4-32k': {
    description: 'GPT-4 32k Chat',
    price: {
      prompt: 0.06 / 1000,
      completion: 0.12 / 1000,
    }
  },
  // Embeddings
  'text-embedding-ada-002': {
    description: 'Ada V2 Embeddings',
    price: 0.0002 / 1000,
  }
  // Disabled until Anthropic SDK has a token count method
  // 'claude-v1': 32.68 / 1000000, // ($32.68/million tokens)
  // 'claude-instant-v1': 5.51 / 1000000, // ($5.51/million tokens)
};

export default function Stat({ label, displayValue }: StatProps) {
  return <div className="stat">
    <div className="stat-value">{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}</div>
    <div className="stat-label">{label}</div>
  </div>
}

function displayAsCents(input: number)  {
  if(input < 0.01) {
    return '< 1¢';
  }
  return `${Math.round(input * 1000) / 10}¢`;
}

function displayAsDollars(input: number)  {
  return formatter.format(input);
}

function displayPrice(input: number) {
  if(input < 1) {
    return displayAsCents(input);
  }
  return displayAsDollars(input);
}

export function PriceStats({ tokens, encoding }: { tokens: number, encoding: Encoding }) {
  return <>

    {Object.entries(pricePerToken)
      // filter for models that support the current encoding
      .filter(([model, details]) => {
        // The current model is
        return modelToEncodingMap[model as ModelName] === encoding
      })
      // Loop over a display
      .map(([model, { price, description }]) => {
      if(typeof price === 'object') {
        return <>
          <Stat key={`${model}-prompt`} displayValue={displayPrice(price.prompt * tokens)} label={`${description} Prompt`} />
          <Stat key={`${model}-completion`} displayValue={displayPrice(price.completion * tokens)} label={`${description} Completion`} />
        </>
      }
        return <Stat key={model} displayValue={displayPrice(price * tokens)} label={description} />
    })}
  </>
}
