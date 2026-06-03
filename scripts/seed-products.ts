import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating subscription products...');

  const existingProducts = await stripe.products.list({ limit: 100 });
  const existingNames = existingProducts.data.map(p => p.name);

  if (!existingNames.includes('Monthly Premium')) {
    const monthlyProduct = await stripe.products.create({
      name: 'Monthly Premium',
      description: 'Monthly premium subscription for Lawncare Workshop',
      metadata: {
        type: 'subscription',
        interval: 'month'
      }
    });

    await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 999,
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    console.log('Created Monthly Premium product:', monthlyProduct.id);
  } else {
    console.log('Monthly Premium already exists');
  }

  if (!existingNames.includes('Yearly Premium')) {
    const yearlyProduct = await stripe.products.create({
      name: 'Yearly Premium',
      description: 'Yearly premium subscription for Lawncare Workshop - Save 25%!',
      metadata: {
        type: 'subscription',
        interval: 'year'
      }
    });

    await stripe.prices.create({
      product: yearlyProduct.id,
      unit_amount: 8999,
      currency: 'usd',
      recurring: { interval: 'year' },
    });

    console.log('Created Yearly Premium product:', yearlyProduct.id);
  } else {
    console.log('Yearly Premium already exists');
  }

  console.log('Product setup complete!');
}

createProducts().catch(console.error);
