from django.core.management.base import BaseCommand
from catalog.models import Area, Category, MedicalStore, Medicine, State

class Command(BaseCommand):
    help = 'Seed MediNear with development locations, categories, stores and medicines.'
    def handle(self, *args, **options):
        locations = {'Andhra Pradesh': ['Eluru', 'Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati', 'Rajahmundry'], 'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda']}
        states = {name: State.objects.get_or_create(name=name)[0] for name in locations}
        areas = {area: Area.objects.get_or_create(state=states[state], name=area)[0] for state, names in locations.items() for area in names}
        category_names = ['Tablets', 'Capsules', 'Syrups', 'First Aid', 'Vitamins', 'Pain Relief', 'Cold & Fever', 'Diabetes Care', 'Baby Care', 'Health Devices']
        categories = {name: Category.objects.get_or_create(name=name)[0] for name in category_names}
        stores = [('Sri Sai Medicals', 'Eluru'), ('Apollo Pharmacy', 'Eluru'), ('Care & Cure Pharmacy', 'Vijayawada'), ('Wellness Point', 'Hyderabad'), ('Health Hub', 'Guntur')]
        for name, area in stores:
            store, _ = MedicalStore.objects.get_or_create(name=name, area=areas[area], defaults={'address': f'Main Road, {area}', 'verified': True})
            for index in range(4):
                Medicine.objects.get_or_create(store=store, name=f'{category_names[index]} Essential {index + 1}', defaults={'brand': 'MediNear Labs', 'category': categories[category_names[index]], 'price': 40 + (index * 35), 'stock': 50, 'description': 'Quality healthcare product from a verified pharmacy.'})
        self.stdout.write(self.style.SUCCESS('MediNear demo data seeded.'))
